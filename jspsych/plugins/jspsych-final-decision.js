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
    
        //GLOBAL VARIABLE
        var human_final_decision = null;
        var confidence_ans = "";

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
            //display_element.appendChild(document.createTextNode(evt.target.innerText));

            //let clickedButton = evt.target
            //let buttonText = clickedButton.innerText

            if (evt.target.innerText == "LAUNCH")
                human_final_decision = true;
            else
                human_final_decision = false;

            console.log(human_final_decision)

            //break;
            //setButtonsWhite(buttonDiv)
            // if (evt.target.style.backgroundColor != '#87CEEB'){
            //     evt.target.style.backgroundColor = '#87CEEB'
            //     break
            // }

            
            // if (evt.target.style.backgroundColor == '#87CEEB')
            //     if (evt.target.innerText == "LAUNCH"){
            //         evt.target.style.backgroundColor = '#008000'
            //     }
            //     evt.target.style.backgroundColor = '#FF0000'
            // }


            //updateGNGButtons()
            //checkSatisfyTab(buttonDiv.tab_button);
        }

        function handleConfButtons(evt)
        {
            //display_element.appendChild(document.createTextNode(evt.target.innerText));

            //let clickedButton = evt.target
            //let buttonText = clickedButton.innerText
            confidence_ans = evt.target.innerText;
            console.log(confidence_ans)

            end_trial(true);

            // if (evt.target.innerText == "LAUNCH")
            //     human_final_decision = true;

            // console.log(human_final_decision)

            //break;
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
        }
        let decision_text = document.createTextNode('What is your final decision?')
        display_element.appendChild(decision_text);
        display_element.appendChild(document.createElement('br'))
        display_element.appendChild(launch_button)
        display_element.appendChild(abort_button)
        launch_button.addEventListener('click', handleAnswerButton);
        abort_button.addEventListener('click', handleAnswerButton);

        //launch_button.addEventListener('click', (evt)=>{end_trial(true)});
        //abort_button.addEventListener('click', (evt)=>{end_trial(false)});

        display_element.appendChild(document.createElement('br'))
        // display_element.appendChild(document.createElement('br'))
        // display_element.appendChild(document.createTextNode('How confident are you in your final decision?'));
        // display_element.appendChild(document.createElement('br'))

        let notAtAll = document.createElement('button');
        let notVery = document.createElement('button');
        let somewhat = document.createElement('button');
        let fairly = document.createElement('button');
        let very = document.createElement('button');
        notAtAll.innerText = '-2: Not at All'
        notVery.innerText = '-1: Not Very'
        somewhat.innerText = '0: Somewhat'
        fairly.innerText = '1: Fairly'
        very.innerText = '2: Very'
        
        // //launch_button.style.backgroundColor = plugin.colors.green
        // //abort_button.style.backgroundColor = plugin.colors.red
        let conf_buttons = [notAtAll, notVery, somewhat, fairly, very]
        for (let i=0; i<5; i++)
        {
            let button = conf_buttons[i]
            button.color = 'white'
            Object.assign(button.style,
            {
                padding: '5px',
                margin: '5px',
                borderRadius: '4px',
                fontSize: '18px',
            });
        }
        let confidence_text = document.createTextNode('How confident are you in your final decision?')
        display_element.appendChild(confidence_text);
        display_element.appendChild(document.createElement('br'))
        display_element.appendChild(notAtAll)
        display_element.appendChild(notVery)
        display_element.appendChild(somewhat)
        display_element.appendChild(fairly)
        display_element.appendChild(very)

        notAtAll.addEventListener('click', handleConfButtons);
        notVery.addEventListener('click', handleConfButtons);
        somewhat.addEventListener('click', handleConfButtons);
        fairly.addEventListener('click', handleConfButtons);
        very.addEventListener('click', handleConfButtons);

        //launch_button.addEventListener('click', handleAnswerButton);
        //abort_button.addEventListener('click', handleAnswerButton);

        function end_trial(go)
        {

            // if(human_final_decision == null){
            //     decision_text.style.color = plugin.colors.red            
            // }
            
            // if(confidence_ans == ""){
            //     confidence_text.style.color = plugin.colors.red            
            // }
            
            if(human_final_decision != null && confidence_ans != ""){
                var trial_data =
                {
                  //conf_answer: go
                  //rt: performance.now()-start_time,
                };
                
                trial_data['final_execute']= human_final_decision
                trial_data['confidence_ans']= confidence_ans
                console.log(trial_data)
              
                // clear the display
                //display_element.innerHTML = '';
              
                // move on to the next trial
                jsPsych.finishTrial(trial_data);
            }

            
        }


    }
    return plugin;
})();
