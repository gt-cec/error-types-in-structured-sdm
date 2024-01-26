jsPsych.plugins["entry-chart"] = (function() {

    var plugin = {};
  
    plugin.info = {
        name: "entry-chart",
        parameters: {
            chart_paths: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'Chart Filenames',
                default: undefined,
                description: 'Paths to the charts'
            },
            show_questions: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Show Questions?',
                default: false,
                description: 'Whether to ask questions evaluating each chart',
            },
            ai_judgement: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: "AI Judgement",
                default: undefined,
                description: "Whether the AI judged the conditions to be safe. Can be 'undefined' for versions 0/1."
            },
            human_judgement: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: "Human Judgement",
                default: undefined,
                description: "Whether the Human judged the conditions to be safe. Can be 'undefined' for versions 0/1."
            },
            show_judgement: {
                pretty_name: "Show Judgement?",
                description: "Whether to show judgement indicators",
            }
        },
    };
    plugin.colors =
    {
        red: "#FF6450",
        green: "#50FF64",
        blue: "#6450FF",
    };
    plugin.trial = function(display_element, trial) {
  
        var result;
  
        var continue_bar = document.createElement("div");
        continue_bar.classList.add('jspsych-nav-bar');
        continue_bar.style.listStyleType = 'none';
        continue_bar.style.textAlign = 'center';
        continue_bar.style.margin = '0px';
        continue_bar.style.padding = '0px 0px 30px 0px';
        let continue_button = document.createElement("button");
        Object.assign(continue_button,
        {
            class: 'jspsych-btn',
            disabled: false,
            innerHTML: "Continue",
        });
        let blue = plugin.colors.blue;
        Object.assign(continue_button.style,
        {
            backgroundColor: blue,
            marginLeft: '150px',
            borderRadius: '10%',
            fontSize: "24px",
            color: "white",
        });
        continue_bar.insertBefore(continue_button, null);
  
        // add gng buttons to screen
        display_element.insertBefore(continue_bar, null);
  
        var div1 = document.createElement("div");
        var div2 = document.createElement("div");
        var div3 = document.createElement("div");
        var div4 = document.createElement("div");
        var div5 = document.createElement("div");
        var div6 = document.createElement("div");
  
        var divClear = document.createElement("div"); // makes sure the top and bottom rows seperate
        div1.id = 'topLeft';
        //div1.style.width = '350px';
        //div1.style.height = '350px';
        div1.style.float = 'left';
        //div1.style.padding = '0px 30px 30px 0px';
  
        div2.id = 'topCenter';
        //div2.style.width = '350px';
        //div2.style.height = '350px';
        div2.style.float = 'left';
        //div2.style.padding = '0px 30px 30px 30px';
  
        div3.id = 'bottomRight';
        //div3.style.width = '350px';
        //div3.style.height = '350px';
        div3.style.float = 'left';
        //div3.style.padding = '0px 0px 30px 30px';
  
        div4.id = 'bottomLeft';
        //div4.style.width = '350px';
        //div4.style.height = '350px';
        div4.style.float = 'left';
        //div4.style.padding = '0px 30px 0px 0px';
  
        divClear.style.clear = 'both';
  
        div5.id = 'bottomCenter';
        //div5.style.width = '350px';
        //div5.style.height = '350px';
        div5.style.float = 'left';
        //div5.style.padding = '0px 30px 0px 30px';
  
        divClear.style.clear = 'both';
  
        div6.id = 'bottomRight';
        //div6.style.width = '350px';
        //div6.style.height = '350px';
        div6.style.float = 'left';
        //div6.style.padding = '0px 0px 0px 30px';
  
        divClear.style.clear = 'both';
  
        function updateContinueButton()
        {
            if (!trial.show_questions)
                return
            let buttonDivs = document.getElementsByClassName('buttonDiv')
            var all_good = true // for AND iteration
            for(var i=0; i<buttonDivs.length; i++)
                all_good = all_good && buttonDivs[i].selectedButton != null
            if(all_good)
            {
                continue_button.disabled = false
                let style = continue_button.style
                style.color='white'
                style.borderColor='gray'
                style.backgroundColor=blue
            }
            else
            {
                continue_button.disabled = true
                let style = continue_button.style
                style.color=blue
                style.borderColor=blue
                style.backgroundColor='gray'
            }
        }
  
        let chartDivs = [div1, div2, div3, div4, div5, div6]
  
        let chartWidth = 300 //full size: 450, 300
        let chartHeight = 200
        var imgElements = []
        for(var i=0; i<6; i++)
        {
            var div = chartDivs[i] // pull the corresponding div
            var imgElement = document.createElement('img') // create an image, set properties
            imgElement.src = trial.chart_paths[i] // filename from trial parameters
            imgElement.width = chartWidth
            imgElement.height = chartHeight
            div.insertBefore(imgElement, null) // actually insert it into the document
            
            if(!trial.show_questions)
                continue

            div.insertBefore(document.createElement('br'), null) // force vertical layout
  
            var buttonDiv = document.createElement('div')
            buttonDiv.id = 'chart'+i+'-buttons'
            buttonDiv.classList.add('buttonDiv')
            
            buttonDiv.selectedButton = null //custom; start with nothing selected
            
            var good_button = document.createElement('button')
            var maybe_button = document.createElement('button')
            var bad_button = document.createElement('button')
            buttonDiv.chartButtons = [good_button, maybe_button, bad_button]
            
            good_button.id = 'chart'+i+'-good-button'
            good_button.innerText = 'Good'
            good_button.active_color = 'green'
            maybe_button.id = 'chart'+i+'-maybe-button'
            maybe_button.innerText = 'Maybe'
            maybe_button.active_color = 'blue'
            bad_button.id = 'chart'+i+'-bad-button'
            bad_button.innerText = 'Bad'
            bad_button.active_color = 'red'
  
            function setButtonsWhite(buttonDiv)
            {
                for(var j=0; j<buttonDiv.chartButtons.length; j++)
                    buttonDiv.chartButtons[j].style.backgroundColor = 'white'
            }
            setButtonsWhite(buttonDiv)
  
            function updateButtons(evt)
            {
                let clickedButton = evt.target
                buttonDiv = clickedButton.parentElement
                buttonDiv.selectedButton = clickedButton.innerText
                setButtonsWhite(buttonDiv)
                clickedButton.style.backgroundColor = clickedButton.active_color
                updateContinueButton()
            }
            
            for(var j=0; j<buttonDiv.chartButtons.length; j++)
            {
                let button = buttonDiv.chartButtons[j]
                button.addEventListener('click', updateButtons)
                buttonDiv.insertBefore(button, null)
            }
            div.insertBefore(buttonDiv, null)
            div.buttonDiv = buttonDiv
        }
  
        display_element.insertBefore(div1, null);
        display_element.insertBefore(div2, null);
        display_element.insertBefore(div3, null);
        display_element.insertBefore(divClear, null);
        display_element.insertBefore(div4, null);
        display_element.insertBefore(div5, null);
        display_element.insertBefore(div6, null);
  
        updateContinueButton()
  
        let assessDiv = document.createElement('div');
        {   // namespace for setup
            /*
            if there was earlier info passed, make safe/risky buttons for human and AI
            make abort and execute buttons
            */
            if (trial.show_judgement)
            {   // show judgements from previous step
                let judgement_div = document.createElement('div');
                let judgement_label = document.createElement('p')
                Object.assign(judgement_label,
                {
                    innerHTML: "Assessment of conditions from previous step",
                })
                judgement_div.appendChild(judgement_label)
                judgement_div.appendChild(document.createElement('br'))
                let add_judgement_button = function(label, safe)
                {
                    let button = document.createElement('button');
                    Object.assign(button,
                    {
                        class: 'jspsych-btn',
                        innerHTML: safe? "SAFE":"RISKY",
                        disabled: true,
                    });
                    Object.assign(button.style,
                    (safe?
                    {
                        color: plugin.colors.green,
                    } : {
                        color: plugin.colors.red,
                    }
                    ));
                    judgement_div.appendChild(document.createTextNode(label))
                    judgement_div.appendChild(button)
                }
                add_judgement_button('Yours: ', trial.human_judgement)
                add_judgement_button("AI's: ", trial.ai_judgement)
                assessDiv.appendChild(judgement_div)
            }
            let decision_div = document.createElement('div')
            let decision_label = document.createElement('p')
            decision_label.innerHTML = 'What is your recommendation?'
            decision_div.appendChild(decision_label)
            decision_div.appendChild(document.createElement('br'))
            let execute_button = document.createElement('button')
            Object.assign(execute_button,
            {
                class: 'jspsych-btn',
                innerHTML: 'LAUNCH',
            });
            Object.assign(execute_button.style,
            {
                backgroundColor: plugin.colors.green,
                padding: '5px',
                margin: '5px',
                borderRadius: '4px',
                fontSize: '18px',
            });
            decision_div.appendChild(execute_button)
            let abort_button = document.createElement('button')
            Object.assign(abort_button,
            {
                class: 'jspsych-btn',
                innerHTML: 'ABORT',
            });
            Object.assign(abort_button.style,
            {
                backgroundColor: plugin.colors.red,
                padding: '5px',
                margin: '5px',
                borderRadius: '4px',
                fontSize: '18px',
            });
            decision_div.appendChild(abort_button)
            execute_button.addEventListener('click', (evt)=>{end_trial(true)});
            abort_button.addEventListener('click', (evt)=>{end_trial(false)});
            assessDiv.append(decision_div)
        }

        continue_button.addEventListener('click', (evt)=>
        {
            display_element.insertBefore(assessDiv, null)
        });
  
        // start timing
        var start_time = performance.now();
  
        // function to end trial when it is time
        function end_trial(execute)
        {
            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();
          
            // gather the data to store for the trial
            var trial_data =
            {
              recommend_execute: execute,
              rt: performance.now()-start_time,
            };
            if(trial.show_questions)
            {
                trial_data.chart1_response = div1.buttonDiv.selectedButton
                trial_data.chart2_response = div2.buttonDiv.selectedButton
                trial_data.chart3_response = div3.buttonDiv.selectedButton
                trial_data.chart4_response = div4.buttonDiv.selectedButton
                trial_data.chart5_response = div5.buttonDiv.selectedButton
                trial_data.chart6_response = div6.buttonDiv.selectedButton
            }
            console.log(trial_data)
          
            // clear the display
            display_element.innerHTML = '';
          
            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };
    };
  
    return plugin;
})();
