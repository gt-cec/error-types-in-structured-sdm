jsPsych.plugins['final-decision'] = (function () {
    var plugin = {};

    plugin.info =
    {
        name: 'final-decision',
        description: 'Interface to make the final decision to launch or abort',
        parameters:
        {
            human_judgement:
            {
                pretty_name: 'Human Judgement',
                description: 'What the human chose on the world state judgement screen.',
            },
            ai_judgement:
            {
                pretty_name: 'AI Judgement',
                description: 'How the AI judged the world state this trial',
            },
            show_judgement:
            {
                pretty_name: 'Show Judgement?',
                description: "Whether to show judgement indicators",
            },
            human_opinion:
            {
                pretty_name: 'Human Opinion',
                description: "The human's opinion from the entry chart page",
            },
            ai_opinion:
            {
                pretty_name: 'AI Opinion',
                description: "The AI's launch opinion",
            },
        }
    }

    plugin.colors =
    {
        red: "#FF6450",
        green: "#50FF64",
        blue: "#6450FF",
    };
    
    plugin.trial = function(display_element, trial) {
    
        let heading = document.createElement('p');
        heading.innerHTML = 'Review and final decision'
        display_element.appendChild(heading)
        display_element.appendChild(document.createElement('hr'))
        if (trial.show_judgement)
        {
            let judgement_div = document.createElement('div')
            judgement_div.appendChild(document.createTextNode('World state assessments'))
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
                {
                    padding: '5px',
                    margin: '5px',
                    borderRadius: '4px',
                });
                Object.assign(button.style, 
                (safe? 
                { 
                    color: plugin.colors.green, 
                    // TODO 
                } : { 
                    color: plugin.colors.red, 
                    // TODO 
                } 
                )); 
                judgement_div.appendChild(document.createTextNode(label)) 
                judgement_div.appendChild(button) 
            }
            add_judgement_button('Yours: ', trial.human_judgement)
            add_judgement_button("AI's: ", trial.ai_judgement)
            display_element.appendChild(judgement_div)
        }

         function handleAnswerButton(evt)
        {
            let clickedButton = evt.target
            let buttonDiv = clickedButton.parentElement
            buttonDiv.selectedAnswer.value = clickedButton.innerText
            //setButtonsWhite(buttonDiv)
            //clickedButton.style.backgroundColor = '#87CEEB'
            //updateGNGButtons()
            //checkSatisfyTab(buttonDiv.tab_button);
        }


        let opinion_div = document.createElement('div')
        opinion_div.style.margin='20px'
        let add_opinion_button = function(label, go) 
        { 
            let button = document.createElement('button'); 
            Object.assign(button, 
            { 
                class: 'jspsych-btn', 
                innerHTML: go? "LAUNCH":"ABORT", 
                disabled: true, 
            });
            Object.assign(button.style,
            {
                padding: '5px',
                margin: '5px',
                borderRadius: '4px',
            });
            Object.assign(button.style, 
            (go? 
            { 
                color: plugin.colors.green, 
                // TODO 
            } : { 
                color: plugin.colors.red, 
                // TODO 
            } 
            )); 
            opinion_div.appendChild(document.createTextNode(label)) 
            opinion_div.appendChild(button)
            return button
        }
        opinion_div.appendChild(document.createTextNode('Recommendations based on trajectories:'))
        opinion_div.appendChild(document.createElement('br'))
        add_opinion_button('Yours:', trial.human_opinion)
        add_opinion_button("AI's:", trial.ai_opinion)
        display_element.appendChild(opinion_div);
        display_element.appendChild(document.createElement('br'))

        var buttonDiv = document.createElement('div')
        buttonDiv.classList.add('buttonDiv')
        //buttonDiv.selectedAnswer = {value: (multibuttons? [] : null)}
        buttonDiv.selectedAnswer = {value: null}
        let launch_button = document.createElement('button')
        let abort_button = document.createElement('button')
        launch_button.innerText = 'LAUNCH'
        abort_button.innerText = 'ABORT'
        launch_button.style.backgroundColor = plugin.colors.green
        abort_button.style.backgroundColor = plugin.colors.red
        let buttons = [launch_button, abort_button]
        for (let i=0; i<2; i++)
        {
            let button = buttons[i]
            button.color = 'white'
            Object.assign(button.style,
            {
                padding: '5px',
                margin: '5px',
                borderRadius: '4px',
                fontSize: '18px',
            });
            buttonDiv.insertBefore(button, null)
        }
        opinion_div.insertBefore(buttonDiv, null)
        opinion_div.buttonDiv = buttonDiv
        opinion_div.selectedAnswer = buttonDiv.selectedAnswer        
        display_element.appendChild(document.createTextNode('What is your final decision?'));
        display_element.appendChild(document.createElement('br'))
        display_element.appendChild(launch_button)
        display_element.appendChild(abort_button)
        //launch_button.addEventListener('click', handleAnswerButton);
        //abort_button.addEventListener('click', handleAnswerButton);


        // Make confidence panel
        var confDiv = document.createElement('div');
        {
            let div = confDiv;
            div.id = 'confidence-panel'
            let label = document.createElement('p');
            label.innerHTML = 'How confident are you in your final decision?';
            div.insertBefore(label, null);
            let buttonPanel = document.createElement('div');
            buttonPanel.classList.add('buttonPanel')
            buttonPanel.selectedAnswer = {value: null}
            let notAtAll = document.createElement('button');
            let notVery = document.createElement('button');
            let somewhat = document.createElement('button');
            let fairly = document.createElement('button');
            let very = document.createElement('button');
            // notAtAll.innerText = '-2: Not at All'
            // notVery.innerText = '-1: Not Very'
            // somewhat.innerText = '0: Somewhat'
            // fairly.innerText = '1: Fairly'
            // very.innerText = '2: Very'

            [notAtAll, notVery, somewhat, fairly, very].forEach((item) =>
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

            buttonPanel.insertBefore(notAtAll, null);
            buttonPanel.insertBefore(notVery, null);
            buttonPanel.insertBefore(somewhat, null);
            buttonPanel.insertBefore(fairly, null);
            buttonPanel.insertBefore(very, null);
            div.notAtAll = notAtAll;
            div.notVery = notVery;
            div.somewhat = somewhat;
            div.fairly = fairly;
            div.very = very;
            div.insertBefore(buttonPanel, null);
            div.buttonPanel = buttonPanel
            div.selectedAnswer = buttonPanel.selectedAnswer
        }

        display_element.appendChild(confDiv)


        confDiv.notAtAll.addEventListener('click', (evt) => 
        {
           endTrial(true); 
        });
        confDiv.notVery.addEventListener('click', (evt) => 
        {
            endTrial(false);
        });
        confDiv.somewhat.addEventListener('click', (evt) => 
        {
            endTrial(true);
        });
        confDiv.fairly.addEventListener('click', (evt) => 
        {
            endTrial(false);
        });
        confDiv.very.addEventListener('click', (evt) => 
        {
            endTrial(false);
        });




        //launch_button.addEventListener('click', (evt)=>{end_trial(true)});
        //abort_button.addEventListener('click', (evt)=>{end_trial(false)});

        function end_trial(go)
        {
            // kill any remaining setTimeout handlers
            //jsPsych.pluginAPI.clearAllTimeouts();
          
            // gather the data to store for the trial
            var trial_data =
            {
              confidence: go,
              rt: performance.now()-start_time,
            };
            
            trial_data['final_execute']= buttonDiv.selectedAnswer.value
            //trial_data['confidence'] = go

            // if(trial.show_questions)
            // {
            //     trial_data.chart1_response = div1.buttonDiv.selectedButton
            //     trial_data.chart2_response = div2.buttonDiv.selectedButton
            //     trial_data.chart3_response = div3.buttonDiv.selectedButton
            //     trial_data.chart4_response = div4.buttonDiv.selectedButton
            //     trial_data.chart5_response = div5.buttonDiv.selectedButton
            //     trial_data.chart6_response = div6.buttonDiv.selectedButton
            // }
            console.log(trial_data)
          
            // clear the display
            display_element.innerHTML = '';
          
            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };






        // function end_trial(go)
        // {
        //     jsPsych.finishTrial({final_execute: go})
        // }
    }
    return plugin;
})();
