/* jspsych-trial-of-trials.js
 * Robert "Bowe" Andrews
 *
 * This plugin takes in multiple trials and allows for tab like navigation between them
 *
 * documentation: contact Bowe Andrews - boweandrews@gatech.edu or 440-804-4012
 *
 *
 */

jsPsych.plugins['trial-of-trials'] = (function () {
    var plugin = {};

    jsPsych.pluginAPI.registerPreload('image-button-response', 'stimulus', 'image');
  
    plugin.info = {
        name: 'trial-of-trials',
        description: '',
        parameters: {
          trial1: {
            type: jsPsych.plugins.parameterType.OBJECT,
            pretty_name: 'Trial 1',
            default: undefined,
            array: true,
            description: 'Content for Trial 1.'
          },
          trial2: {
            type: jsPsych.plugins.parameterType.OBJECT,
            pretty_name: 'Trial 2',
            default: undefined,
            array: true,
            description: 'Content for Trial 2.'
          },
          key_forward: {
            type: jsPsych.plugins.parameterType.KEY,
            pretty_name: 'Key forward',
            default: 'ArrowRight',
            description: 'The key the subject can press in order to advance to the next page.'
          },
          key_backward: {
            type: jsPsych.plugins.parameterType.KEY,
            pretty_name: 'Key backward',
            default: 'ArrowLeft',
            description: 'The key that the subject can press to return to the previous page.'
          },
          allow_backward: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Allow backward',
            default: true,
            description: 'If true, the subject can return to the previous page of the instructions.'
          },
          allow_keys: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Allow keys',
            default: true,
            description: 'If true, the subject can use keyboard keys to navigate the pages.'
          },
          show_clickable_nav: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Show clickable nav',
            default: false,
            description: 'If true, then a "Previous" and "Next" button will be displayed beneath the instructions.'
          },
          show_page_number: {
              type: jsPsych.plugins.parameterType.BOOL,
              pretty_name: 'Show page number',
              default: false,
              description: 'If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons.'
          },
          page_label: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Page label',
            default: 'Page',
            description: 'The text that appears before x/y (current/total) pages displayed with show_page_number'
          },      
          button_label_1: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Button label GPS',
            default: 'GPS',
            description: 'The text that appears on the button to go to page 1.'
          },
          button_label_2: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Button label weather',
            default: 'Weather',
            description: 'The text that appears on the button to go to page 2.'
          },
          button_label_abort: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Button label abort',
            default: 'Abort',
            description: 'The text that appears on the button to go to page 2.'
          },
          button_label_continue: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Button label continue',
            default: 'Continue',
            description: 'The text that appears on the button to go to page 2.'
          },
          render_on_canvas: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Render on canvas',
            default: false,
            description: 'If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).'+
              'If false, the image will be shown via an img element.'
          }
        }
      }
    
      plugin.trial = function(display_element, trial) {
    
        var current_page = 0;
    
        var view_history = [];
    
        var start_time = performance.now();

        var gps_answer;

        var weather_answer;

        var gps_color = 'white';

        var weather_color = 'white';

        var abort = false;

        var which;
    
        var last_page_update_time = start_time;

        var num_tabs = 2; // similar to what used to be referred to as trial.pages.length
    
        function btnListener(evt){
            evt.target.removeEventListener('click', btnListener);
            if(this.id === "jspsych-instructions-GPS"){
              GPS();
            }
            else if(this.id === 'jspsych-instructions-Weather'){
              Weather();
            } else if(this.id.substring(0, this.id.length-1) === 'jspsych-button'){
              which = this.id.charAt(this.id.length-1)
              buttonClick(which);
            } else if(this.id === 'jspsych-instructions-Continue'){
              endTrial();
            } else if(this.id === 'jspsych-instructions-Abort') {
              abort = true;
              endTrial();
            }
        }
    
        function show_current_page() {
            var height, width;
            var html;
            // The specific image button response that we want to display
            var trial_used;
            var this_answer;
            if (current_page == 0) {
                trial_used = trial.trial1;
                this_answer = gps_answer;
            } else if (current_page == 1) {
                trial_used = trial.trial2;
                this_answer = weather_answer;
            }
            if (trial.render_on_canvas) {
              var image_drawn = false;
              // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
              if (display_element.hasChildNodes()) {
                // can't loop through child list because the list will be modified by .removeChild()
                while (display_element.firstChild) {
                  display_element.removeChild(display_element.firstChild);
                }
              }
              // create canvas element and image
              var canvas = document.createElement("canvas");
              canvas.id = "jspsych-image-button-response-stimulus";
              canvas.style.margin = 0;
              canvas.style.padding = 0;
              var ctx = canvas.getContext("2d");
              var img = new Image();   
              img.onload = function() {
                // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
                if (!image_drawn) {
                  getHeightWidth(); // only possible to get width/height after image loads
                  ctx.drawImage(img,0,0,width,height);
                }
              };
              img.src = trial_used.stimulus;
              // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
              function getHeightWidth() {
                if (trial_used.stimulus_height !== null) {
                  height = trial_used.stimulus_height;
                  if (trial_used.stimulus_width == null && trial_used.maintain_aspect_ratio) {
                    width = img.naturalWidth * (trial_used.stimulus_height/img.naturalHeight);
                  }
                } else {
                  height = img.naturalHeight;
                }
                if (trial_used.stimulus_width !== null) {
                  width = trial_used.stimulus_width;
                  if (trial_used.stimulus_height == null && trial_used.maintain_aspect_ratio) {
                    height = img.naturalHeight * (trial_used.stimulus_width/img.naturalWidth);
                  }
                } else if (!(trial_used.stimulus_height !== null & trial_used.maintain_aspect_ratio)) {
                  // if stimulus width is null, only use the image's natural width if the width value wasn't set 
                  // in the if statement above, based on a specified height and maintain_aspect_ratio = true
                  width = img.naturalWidth;
                }
                canvas.height = height;
                canvas.width = width;
              }
              getHeightWidth(); // call now, in case image loads immediately (is cached)
              // create buttons
              var buttons = [];
              if (Array.isArray(trial_used.button_html)) {
                if (trial_used.button_html.length == trial_used.choices.length) {
                  buttons = trial_used.button_html;
                } else {
                  console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
                }
              } else {
                for (var i = 0; i < trial_used.choices.length; i++) {
                  buttons.push(trial_used.button_html);
                }
              }
              var btngroup_div = document.createElement('div');
              btngroup_div.id = "jspsych-image-button-response-btngroup";
              html = '';
              for (var i = 0; i < trial_used.choices.length; i++) {
                console.log(buttons)
                var str = buttons[i].replace(/%choice%/g, trial_used.choices[i]);
                html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:'+trial_used.margin_vertical+' '+trial_used.margin_horizontal+'" id="jspsych-image-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
              }
              btngroup_div.innerHTML = html;
              // add canvas to screen and draw image
              display_element.insertBefore(canvas, null);
              if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
                // if image has loaded and width/height have been set, then draw it now
                // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
                ctx.drawImage(img,0,0,width,height);
                image_drawn = true;  
              }
              // add buttons to screen
              display_element.insertBefore(btngroup_div, canvas.nextElementSibling);
              var choices = "<div class='jspsych-nav-bar' style='list-style-type: none; text-align: center; margin: 0;padding: 0'>";
        
              for (var i = 0; i < trial_used.choices.length; i++) {
                //var str = buttons[i].replace(/%choice%/g, trial_used.choices[i]);
                if (this_answer == i) {
                  var button_html = "<button id='jspsych-button"+i+"' class='jspsych-btn' style='margin-right: 5px; background-color: cyan;'>"+trial_used.choices[i]+"</button>";
                  choices += button_html;
                } else {
                  var button_html = "<button id='jspsych-button"+i+"' class='jspsych-btn' style='margin-right: 5px;'>"+trial_used.choices[i]+"</button>";
                  choices += button_html;
                }
              }
              choices += '</div>'
              // add prompt if there is one
              if (trial_used.prompt !== null) {
                display_element.insertAdjacentHTML('beforeend', trial_used.prompt);
              }
        
            } else {
        
              // display stimulus as an image element
              html = '<img src="'+trial_used.stimulus+'" id="jspsych-image-button-response-stimulus" height="500" style="display: block; margin-left: auto; margin-right: auto;">';
              //display buttons
              var buttons = [];
              if (Array.isArray(trial_used.button_html)) {
                if (trial_used.button_html.length == trial_used.choices.length) {
                  buttons = trial_used.button_html;
                } else {
                  console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
                }
              } else {
                for (var i = 0; i < trial_used.choices.length; i++) {
                  buttons.push(trial_used.button_html);
                }
              }
              var choices = "<div class='jspsych-nav-bar' style='list-style-type: none; text-align: center; margin: 0;padding: 0'>";
        
              for (var i = 0; i < trial_used.choices.length; i++) {
                //var str = buttons[i].replace(/%choice%/g, trial_used.choices[i]);
                if (this_answer == i) {
                  var button_html = "<button id='jspsych-button"+i+"' class='jspsych-btn' style='margin-right: 5px; background-color: cyan;'>"+trial_used.choices[i]+"</button>";
                  choices += button_html;
                } else {
                  var button_html = "<button id='jspsych-button"+i+"' class='jspsych-btn' style='margin-right: 5px;'>"+trial_used.choices[i]+"</button>";
                  choices += button_html;
                }
              }
              choices += '</div>'
              // add prompt
              if (trial_used.prompt !== null){
                html += trial_used.prompt;
              }
              
            }
      
            var pagenum_display = "";
            if(trial.show_page_number) {
                pagenum_display = "<span style='margin: 0 1em;' class='"+
                "jspsych-instructions-pagenum'>"+ trial.page_label + ' ' +(current_page+1)+"/"+trial.pages.length+"</span>";
            }
           
            if (trial.show_clickable_nav) {
      
              var nav_html = "<div class='jspsych-nav-bar' style='background-color: white; list-style-type: none; text-align: center; margin: 0;padding: 25px'>";
              var allowed_GPS = (current_page == 1 )? '' : "disabled='disabled'";
              var allowed_Weather = (current_page == 0 )? '' : "disabled='disabled'";
              if (typeof gps_answer !== "undefined") {
                gps_color = 'PaleGreen'
              }
              if (typeof weather_answer !== "undefined") {
                weather_color = 'PaleGreen'
              }
              var GPS_html = "<button id='jspsych-instructions-GPS' class='jspsych-btn' style='background-color:"+gps_color+"; margin-right: 5px;'"+allowed_GPS+">"+trial.button_label_1+"</button>";
              if (num_tabs > 1 && trial.show_page_number) {
                  nav_html += pagenum_display;
              }
              var continue_bool = (typeof gps_answer !== "undefined") && (typeof weather_answer !== "undefined")
              var allowed_Continue = continue_bool? '' : "disabled='disabled'";
              var Weather_html = "<button id='jspsych-instructions-Weather' class='jspsych-btn' style='background-color:"+weather_color+";margin-right: 5px;' "+allowed_Weather+">"+trial.button_label_2+"</button>";
              var abort_html = "<button id='jspsych-instructions-Abort' class='jspsych-btn' style='background-color: red; margin-right: 150px; border-radius: 50%; font-size: 24px; color:white;'>"+trial.button_label_abort+"</button>";
              var continue_html = "<button id='jspsych-instructions-Continue' class='jspsych-btn' style='background-color: green; margin-left: 150px; border-radius: 50%; font-size: 24px; color:white;'"+allowed_Continue+">"+trial.button_label_continue+"</button>";
              html = nav_html + abort_html + GPS_html + Weather_html + continue_html + '</div>' + html + choices;
              display_element.innerHTML = html;
              display_element.querySelector('#jspsych-instructions-GPS').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-instructions-Weather').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button0').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button1').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button2').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button3').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button4').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-instructions-Continue').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-instructions-Abort').addEventListener('click', btnListener);

            } else {
              if (trial.show_page_number && num_tabs > 1) {
                // page numbers for non-mouse navigation
                html += "<div class='jspsych-instructions-pagenum'>"+pagenum_display+"</div>"
              } 
              display_element.innerHTML = html;
            }
            
          }
    
          function buttonClick() {
            if (current_page == 0) {
              gps_answer = which
            } else if (current_page == 1) {
              weather_answer = which
            }
            show_current_page();
          }
        
          function Weather() {
    
          add_current_page_to_view_history()
    
          current_page = 1;
    
          show_current_page();
    
        }
    
        function GPS() {
    
          add_current_page_to_view_history()
    
          current_page = 0;
    
          show_current_page();
        }
    
        function add_current_page_to_view_history() {
    
          var current_time = performance.now();
    
          var page_view_time = current_time - last_page_update_time;
    
          view_history.push({
            gps_response: gps_answer,
            weather_response: weather_answer,
            abort: abort,
            page_index: current_page,
            viewing_time: page_view_time
          });
    
          last_page_update_time = current_time;
        }
    
        function endTrial() {

          add_current_page_to_view_history()
    
          if (trial.allow_keys) {
            jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
          }
    
          display_element.innerHTML = '';
    
          var trial_data = {
            view_history: view_history,
            rt: performance.now() - start_time
          };
    
          jsPsych.finishTrial(trial_data);
        }
    
        var after_response = function(info) {
    
          // have to reinitialize this instead of letting it persist to prevent accidental skips of pages by holding down keys too long
          keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: [trial.key_forward, trial.key_backward],
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
          });
          // check if key is forwards or backwards and update page
          if (jsPsych.pluginAPI.compareKeys(info.key, trial.key_backward)) {
            if (current_page !== 0 && trial.allow_backward) {
              back();
            }
          }
    
          if (jsPsych.pluginAPI.compareKeys(info.key, trial.key_forward)) {
            next();
          }
    
        };
    
        show_current_page();
    
        if (trial.allow_keys) {
          var keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: [trial.key_forward, trial.key_backward],
            rt_method: 'performance',
            persist: false
          });
        }
      };
    
      return plugin;
    })();