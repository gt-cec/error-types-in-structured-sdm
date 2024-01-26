jsPsych.plugins['judgement-feedback'] = (function () {
    var plugin = {};

    plugin.info =
    {
        name: 'judgement-feedback',
        description: 'Feedback screen to show the human what the AI chose on the world judgement screen, compared to what they chose',
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
        heading.innerHTML = 'Results of the world state assessment:'
        display_element.appendChild(heading)
        display_element.appendChild(document.createElement('br'))
        let judgement_div = document.createElement('div')
        let add_judgement_button = function(label, safe) 
        { 
            let button = document.createElement('button'); 
            Object.assign(button, 
            { 
                class: 'jsPsych-btn', 
                innerHTML: safe? "SAFE":"RISKY",
                disabled: true, 
            }); 
            Object.assign(button.style,
            {
                margin: '7.5px',
                color: 'white',
                borderRadius: '4px',
                padding: '5px',
                // TODO make font bigger, make it round. See ToT
            });
            Object.assign(button.style, 
            (safe? 
            { 
                backgroundColor: plugin.colors.green, 
                // TODO 
            } : { 
                backgroundColor: plugin.colors.red, 
                // TODO 
            } 
            )); 
            judgement_div.appendChild(document.createTextNode(label)) 
            judgement_div.appendChild(button) 
            return button
        }
        add_judgement_button('Your assessment:', trial.human_judgement)
        add_judgement_button("AI assessment:", trial.ai_judgement)
        judgement_div.appendChild(document.createElement('br'))

        let continueButton = document.createElement('button');
        let blue = plugin.colors.blue;
        continueButton.disabled = true;
        continueButton.innerHTML = 'Continue';

        let continue_button = add_judgement_button('', true)
        continue_button.id = 'continue-button';
        continue_button.class = 'jspsych-btn';
        continue_button.style.marginLeft = '150px';
        continue_button.style.borderRadius = '50%';
        continue_button.style.fontSize = '24px';
        continue_button.style.color = 'white';
        continue_button.style.padding='10px';
        continue_button.style.backgroundColor = plugin.colors.blue
        continue_button.disabled = false;
        continue_button.innerText = "Continue"
        continue_button.addEventListener('click', (evt)=>
        {
            display_element.innerHTML = ''
            jsPsych.finishTrial({})
        });
        judgement_div.appendChild(continue_button)
        display_element.appendChild(judgement_div)
    }
    return plugin;
})();
