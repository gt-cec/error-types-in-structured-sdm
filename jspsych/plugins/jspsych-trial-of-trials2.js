/* jspsych-trial-of-trials.js
 * Robert "Bowe" Andrews
 * John "Mason" Lilly
 *
 * This plugin takes in multiple trials and allows for tab like navigation between them
 *
 * documentation: contact jmason.lilly@gatech.edu
 *
 *
 */

jsPsych.plugins['trial-of-trials2'] = (function () {
    var plugin = {};

    jsPsych.pluginAPI.registerPreload('image-button-response', 'stimulus', 'image');
  
    plugin.info =
    {
        name: 'trial-of-trials2',
        description: '',
        parameters:
        {
            satellite_image:
            {
                pretty_name: 'GPS Image',
                description: 'path to the image to show in the GPS page',
            },
            weather_image:
            {
                pretty_name: 'Weather Image',
                description: 'path to the iamge to show in the weather page',
            },
            angle_image:
            {
                pretty_name: 'Angle Trial Image',
                description: 'Path to the image to show in the entry angle page',
            },
            enable_questions: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Questions or no questions?',
                default: true,
                description: 'Are the participants prompted to consider the evaluation with a question?'
            },
        }
    }
    
    // Auxiliary questions and answers
    plugin.gps_questions = [
        {
            prompt: 'How many satellites provide coverage at the start of the landing trajectory?',
            choices: ['2 or less', '3', '4', '5 or more'],
        },
        // {
        //     prompt: 'Do any of the satellite coverages overlap over the landing trajectory?',
        //     choices: ['Yes', 'No']
        // },
    ];
    plugin.weather_questions = [
        {
            prompt: 'What is the risk of complications due to weather along the landing trajectory?',
            choices: ['None', 'Low', 'Medium', 'High'],
        },
        // {
        //     prompt: 'How intense is the weather in the landing region as a whole?',
        //     choices: ['None', 'Low', 'Medium', 'High'],
        // },
    ];
    plugin.angle_questions = [
        // {
        //     prompt: 'What is the predicted entry angle?',
        //     choices: ['<9.5', '9.5', '11', '12.5', '14',  '>14'],
        // },
        {
            prompt: 'How optimal is the predicted entry angle?',
            choices: ['Optimal', 'Acceptable', 'Dangerous'],
        },
    ];
    plugin.colors =
    {
        red: "#FF6450",
        green: "#50FF64",
        blue: "#6450FF",
    };

    plugin.trial = function(display_element, trial) {
    
        /*
        This plugin used to take a long time to load.
        Instead of a blank screen, make a "Loading" label appear while the math happens.
        To do that, we need to trick the display into updating early.
        For some reason it doesn't, without the code below.
        */
        let given_onload = trial.on_load //this'd execute right after the current function
        trial.on_load = ()=>(null) //save it so it happens when intended
        function load() {
            load_trial(display_element, trial) //actually initialize the plugin
            if(given_onload != undefined)
                given_onload(trial) //perform any final steps given to us
        }
        setTimeout(load, 1) //fork off a separate thread I guess?
        
        display_element.appendChild(document.createTextNode('Loading...'))
        console.log('Loading...')
    }

    function load_trial(display_element, trial)
    {
        var showAssess = false;

        // create navigation bar
        var divNav = document.createElement("div");
        divNav.class = 'jspsych-nav-bar';
        divNav.style.backgroundColor = 'white';
        divNav.style.listStyle = 'none';
        divNav.style.textAlign = 'center';
        divNav.style.margin = '0px';
        divNav.style.padding = '0px';
        // Make the tab buttons
        let tab_buttons = [];
        ['gps', 'weather', 'angle'].forEach((item, index)=>
        {
            let button = document.createElement('button');
            button.id = 'jspsych-'+item+'-tab-button';
            button.class = 'jspsych-btn';
            button.style.backgroundColor='white';
            button.style.marginRight='5px';
            button.style.borderRadius='4px';
            button.disabled=false;
            button.satisfied=false; // state variable to track progress
            button.answersNeeded = []; // answer objects needed to be satisfied
            button.pageNumber=index;
            tab_buttons.push(button);
        });
        ['GPS', 'Weather', 'Entry Angle'].forEach((item, index)=>
        {
            tab_buttons[index].innerHTML = item;
        });
        // Assign buttons to the nav div
        divNav.gps_button = tab_buttons[0];
        divNav.weather_button = tab_buttons[1];
        divNav.angle_button = tab_buttons[2];
        tab_buttons.forEach((item)=>
        {
            divNav.insertBefore(item, null);
        });
        divNav.tab_buttons = tab_buttons;

        // Create and assign the Continue button
        let continueButton = document.createElement('button');
        let blue = plugin.colors.blue;
        continueButton.id = 'continue-button';
        continueButton.class = 'jspsych-btn';
        continueButton.style.backgroundColor = 'gray';
        continueButton.style.border = blue;
        continueButton.style.marginLeft = '150px';
        continueButton.style.borderRadius = '50%';
        continueButton.style.fontSize = '24px';
        continueButton.style.color = blue;
        continueButton.style.padding='10px';
        continueButton.disabled = true;
        continueButton.innerHTML = 'Continue';
        divNav.insertBefore(continueButton, null);
        divNav.continueButton = continueButton;

        // Precreate image elements
        var gps_image = document.createElement('img');
        var weather_image = document.createElement('img');
        var angle_image = document.createElement('img');
        // Assign pathnames from trial input
        gps_image.src = trial.satellite_image;
        gps_image.width = '550'
        gps_image.height = '550'
        weather_image.src = trial.weather_image;
        weather_image.width = '785',
        weather_image.height = '500',
        angle_image.src = trial.angle_image;
        angle_image.width = '140'
        angle_image.height = '400'

        // Set up question panels
        var gps_question_div1 = null
        //var gps_question_div2 = null
        var weather_question_div1 = null
        //var weather_question_div2 = null
        var angle_question_div1 = null
        //var angle_question_div2 = null

        function makeQuestionDiv(question)
        {
            // let multibuttons = question.allow_multiple == true

            var div = document.createElement('div')
            let p = document.createTextNode(question.prompt)
            div.insertBefore(p, null)
            div.insertBefore(document.createElement('br'), null)
            var buttonDiv = document.createElement('div')
            buttonDiv.classList.add('buttonDiv')
            //buttonDiv.selectedAnswer = {value: (multibuttons? [] : null)}
            buttonDiv.selectedAnswer = {value: null}
            buttonDiv.answerButtons = [] // hold references for later access
            for(var i=0; i<question.choices.length; i++)
            {
                var button = document.createElement('button')
                button.innerText = question.choices[i]
                button.style.borderRadius = '4px'
                // button.addEventListener('click', multibuttons? handleMultiAnswerButton : handleAnswerButton)
                buttonDiv.insertBefore(button, null)
                buttonDiv.answerButtons.push(button)
            }
            setButtonsWhite(buttonDiv)
            div.insertBefore(buttonDiv, null)
            div.buttonDiv = buttonDiv
            div.selectedAnswer = buttonDiv.selectedAnswer // forward reference
            return div
        }

        if(trial.enable_questions)
        {
            gps_question_div1 = makeQuestionDiv(plugin.gps_questions[0]);
            //gps_question_div2 = makeQuestionDiv(plugin.gps_questions[0]);
            weather_question_div1 = makeQuestionDiv(plugin.weather_questions[0]);
            //weather_question_div2 = makeQuestionDiv(plugin.weather_questions[0]);
            angle_question_div1 = makeQuestionDiv(plugin.angle_questions[0]);
            //angle_question_div2 = makeQuestionDiv(plugin.angle_questions[1]);
            var question_divs = {
                all: [gps_question_div1,
                      weather_question_div1,
                      angle_question_div1],
                gps: [gps_question_div1],
                weather: [weather_question_div1],
                angle: [angle_question_div1],
            }
            // add all these divs' "answer" objects to the tab satisfaction requirements
            divNav.gps_button.answersNeeded.push(gps_question_div1.selectedAnswer);
            //divNav.gps_button.answersNeeded.push(gps_question_div2.selectedAnswer);
            divNav.weather_button.answersNeeded.push(weather_question_div1.selectedAnswer);
            //divNav.weather_button.answersNeeded.push(weather_question_div2.selectedAnswer);
            divNav.angle_button.answersNeeded.push(angle_question_div1.selectedAnswer);
            //divNav.angle_button.answersNeeded.push(angle_question_div2.selectedAnswer);
            // link all these question divs to their respective tab buttons
            question_divs.gps.forEach((item) =>
                {item.buttonDiv.tab_button=divNav.gps_button;} );
            question_divs.weather.forEach((item) =>
                {item.buttonDiv.tab_button=divNav.weather_button;} );
            question_divs.angle.forEach((item) =>
                {item.buttonDiv.tab_button=divNav.angle_button;} );
            
        }

        // Make assessment panel
        var assessDiv = document.createElement('div');
        {
            let div = assessDiv;
            div.id = 'assessment-panel'
            let label = document.createElement('p');
            label.innerHTML = 'In your opinion, are these conditions SAFE or RISKY?';
            div.insertBefore(label, null);
            let buttonPanel = document.createElement('div');
            let safeButton = document.createElement('button');
            let riskyButton = document.createElement('button');
            [safeButton, riskyButton].forEach((item) =>
            {
                item.class = 'jspsych-btn';
                let style = item.style;
                Object.assign(item.style,
                {
                    padding: '5px',
                    margin: '5px',
                    borderRadius: '4px',
                    fontSize: '18px',
                });
            });

            let green = plugin.colors.green;
            safeButton.id = 'safe-button';
            safeButton.style.backgroundColor = green
            safeButton.border = green
            safeButton.color = 'white'
            safeButton.innerHTML = 'SAFE';
            let red = plugin.colors.red;
            riskyButton.id = 'risky-button';
            riskyButton.style.backgroundColor = red
            riskyButton.border = red
            riskyButton.color = 'white'
            riskyButton.innerHTML = 'RISKY';
            buttonPanel.insertBefore(safeButton, null);
            buttonPanel.insertBefore(riskyButton, null);
            div.safeButton = safeButton;
            div.riskyButton = riskyButton;
            div.insertBefore(buttonPanel, null);
        }

        // DEFINE BEHAVIORS & ASSIGN CALLBACKS

        // Poll the Continue button to see if it's satisfied
        function checkSatisfyContinue()
        {
            let satisfied = true;
            divNav.tab_buttons.forEach((item)=>
            {
                satisfied = satisfied && item.satisfied;
            });
            if(satisfied)
            {
                let button = divNav.continueButton;
                button.style.backgroundColor=plugin.colors.blue
                button.style.border='white'
                button.style.color='white'
                button.disabled=false;
            }
        }

        // Poll a tab button to see if it's satisfied
        // If the tab button has "answers needed", it requires those to have
        // a non-null value. Otherwise (no-question case), it's satisfied automatically
        function checkSatisfyTab(tab_button)
        {
            let satisfied = true;
            tab_button.answersNeeded.forEach((item)=>
            {
                satisfied = satisfied && (item.value != null);
            });
            tab_button.satisfied = satisfied;
            if(satisfied)
            {
                tab_button.style.backgroundColor = "#87CEEB";
                checkSatisfyContinue();
            }
        }

        function setButtonsWhite(buttonDiv)
        {
            for(var i=0; i<buttonDiv.answerButtons.length; i++)
                buttonDiv.answerButtons[i].style.backgroundColor = 'white'
        }

        function handleAnswerButton(evt)
        {
            let clickedButton = evt.target
            let buttonDiv = clickedButton.parentElement
            buttonDiv.selectedAnswer.value = clickedButton.innerText
            setButtonsWhite(buttonDiv)
            clickedButton.style.backgroundColor = '#87CEEB'
            //updateGNGButtons()
            checkSatisfyTab(buttonDiv.tab_button);
        }

        if(trial.enable_questions)
        {
            question_divs.all.forEach((item) =>
            {
                item.buttonDiv.answerButtons.forEach((button) =>
                {
                    button.addEventListener('click', handleAnswerButton)
                });
            });
        }

        function display_page(index)
        {
            // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
            if (display_element.hasChildNodes()) {
              // can't loop through child list because the list will be modified by .removeChild()
                while (display_element.firstChild) {
                  display_element.removeChild(display_element.firstChild);
                }
            }

            switch(index)
            {
                case 0: // GPS page
                    var div1 = document.createElement("div");
                    div1.style.width = '1000px';
                    div1.style.height = '500px';
                    div1.style.float = 'left';
                    div1.style.padding = '0px 0px 0px 0px';
                    div1.appendChild(gps_image)

                    // add nav bar to screen
                    display_element.insertBefore(divNav, null);
                    // add canvas to screen and draw image
                    display_element.insertBefore(div1, divNav.nextElementSibling);
                    // optionally, add questions below the chart
                    if(gps_question_div1 != null)
                        display_element.insertBefore(gps_question_div1, null)
                    //if(gps_question_div2 != null)
                        //display_element.insertBefore(gps_question_div2, null)
                    break;

                case 1: // Weather page
                    var div = document.createElement("div");
                    div.style.width = '900px';
                    div.style.height = '500px';
                    div.style.float = 'left';
                    div.style.marginBottom = '10px';
                    div.appendChild(weather_image);
                    // add nav bar to screen
                    display_element.insertBefore(divNav, null);
                    // add canvas to screen and draw image
                    display_element.insertBefore(div, divNav.nextElementSibling);
                    // optionally, add a question below the heatmap
                    if(weather_question_div1 != null)
                        display_element.insertBefore(weather_question_div1, null)
                    // if(weather_question_div2 != null)
                    //     display_element.insertBefore(weather_question_div2, null)
                    break;
            
                case 2: // Angle image
                    var div = document.createElement("div");
                    // div.style.width = '300px';
                    // div.style.height = '300px';
                    // div.style.float = 'left';
                    // div.style.marginBottom = '10px';
                    // div.appendChild(angle_image);
                    var label = document.createElement("p")
                    label.innerText="Atmospheric Entry Angle, +/- 1 Degree"
                    div.insertBefore(angle_image, null)
                    div.insertBefore(document.createElement("br"), null)
                    div.insertBefore(label, null)
                    display_element.insertBefore(divNav, null);
                    display_element.insertBefore(div, null)
                    //optionally, add a question below the dial
                    if(angle_question_div1 != null)
                        display_element.insertBefore(angle_question_div1, null)
                    // if(angle_question_div2 != null)
                    //     display_element.insertBefore(angle_question_div2, null)
                    break;
                default:
                    break; // error state but it's 2:30 AM
            };

            if(showAssess)
                display_element.insertBefore(assessDiv, null);
        }
        
        // Wire up tab button callbacks
        divNav.tab_buttons.forEach((item) => 
        {
            let tab_button = item;
            tab_button.addEventListener('click', (evt) => 
            {
                checkSatisfyTab(evt.target);
                display_page(evt.target.pageNumber);
            });
        });

        // Wire up the Continue button
        divNav.continueButton.addEventListener('click', (evt) => 
        {
            showAssess = true;
            display_element.insertBefore(assessDiv, null);
        });

        // Wire up the Assess buttons
        assessDiv.safeButton.addEventListener('click', (evt) => 
        {
           endTrial(true); 
        });
        assessDiv.riskyButton.addEventListener('click', (evt) => 
        {
            endTrial(false);
        });

        function endTrial(response) {

            //add_current_page_to_view_history()
    
            display_element.innerHTML = '';
    
            var trial_data = {
              rt: performance.now() - start_time
            };
            if(trial.enable_questions)
            {
                trial_data['gps_count_response'] = gps_question_div1.selectedAnswer.value;
                //trial_data['gps_furthest_response'] = gps_question_div2.selectedAnswer.value;
                trial_data['weather_path_response'] = weather_question_div1.selectedAnswer.value;
                //trial_data['weather_region_response'] = weather_question_div2.selectedAnswer.value;
                trial_data['angle_rating_response'] = angle_question_div1.selectedAnswer.value;
                //trial_data['angle_number_response'] = angle_question_div2.selectedAnswer.value;
            }
            else
            {
                ['gps_count_response', 
                 'weather_path_response',
                 'angle_rating_response',].forEach((name) => 
                 {
                    trial_data[name] = 'N/A';
                 });
            }

            trial_data['assess_safe'] = response;
            console.log(trial_data)
            jsPsych.finishTrial(trial_data);
        }
    
        display_element.innerHTML = '' //clear the "loading" message
        checkSatisfyTab(divNav.gps_button);
        display_page(0);
        var start_time = performance.now();
      };
    
      return plugin;
    })();
