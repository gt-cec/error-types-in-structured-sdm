/* jspsych-trial-of-trials.js
 * Robert "Bowe" Andrews
 *
 * This plugin takes in multiple trials and allows for tab like navigation between them
 *
 * documentation: contact Bowe Andrews - boweandrews@gatech.edu or 440-804-4012
 *
 *
 */

jsPsych.plugins['trial-of-trials3'] = (function () {
    var plugin = {};

    jsPsych.pluginAPI.registerPreload('image-button-response', 'stimulus', 'image');
  
    plugin.info = {
        name: 'trial-of-trials3',
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
          trial3: {
            type: jsPsych.plugins.parameterType.OBJECT,
            pretty_name: 'Trial 3',
            default: undefined,
            array: true,
            description: 'Content for Trial 3.'
          },
          days_remaining: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Days Remaining',
            default: undefined,
            array: false,
            description: 'Number of Days Remaining.'
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
          button_label_3: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Button label resource',
            default: 'Resource',
            description: 'The text that appears on the button to go to page 3.'
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
          abort_bool: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Allow Abort?',
            default: true,
            description: 'Is the participant allowed to abort the trial from initial instructions?'
          },
          enable_questions2: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Questions or no questions?',
            default: false,
            description: 'Are the participants prompted to consider the evaluation with a question?'
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

        var weather_automated_response = 'none';

        var resource_automated_response = 'none';
    
        var view_history = [];
    
        var start_time = performance.now();

        var gps_answer;

        var weather_answer;

        var resource_answer;

        var gps_color = 'white';

        var weather_color = 'white';

        var resource_color = 'white';

        var abort = false;

        var which;
    
        var last_page_update_time = start_time;

        var num_tabs = 3; // similar to what used to be referred to as trial.pages.length

        //  create GPS orbit data
        var pi = 3.1415926535;
        var e1 = .69;
        var d1 = 100; 
        var e2 = 0;
        var d2 = 210;  
        var e3 = .65;
        var d3 = 95;  
        var e4 = .87;
        var d4 = 75;  
        var e5 = 0;
        var d5 = 80;  
        var e6 = 0;
        var d6 = 250;  
        var e7 = .6;
        var d7 = 90;    
        var theta = 0;
        var step = .01;
        var storageEllipse1 = [];
        var storageEllipse2 = [];
        var storageEllipse3 = [];
        var storageEllipse4 = [];
        var storageEllipse5 = [];
        var storageEllipse6 = [];
        var storageEllipse7 = [];      
        
        while(theta < 2*pi) {
          r1 = (e1*d1)/(1-e1*Math.cos(theta + pi/3)) + d1;
          r2 = (e2*d2)/(1-e2*Math.cos(theta)) + d2;
          r3 = (e3*d3)/(1-e3*Math.cos(theta + (8*pi)/9)) + d2;
          r4 = (e4*d4)/(1-e4*Math.cos(theta - 0.3)) + d4;
          r5 = (e5*d5)/(1-e5*Math.cos(theta)) + d5;
          r6 = (e6*d6)/(1-e6*Math.cos(theta)) + d6;
          r7 = (e7*d7)/(1-e7*Math.cos(theta)) + d7;

          // Constants are added to theta for orbits 1,3 and 4 to change arguments of perigee
          var orbit1 = {x:r1 * Math.cos(theta), y:r1 * Math.sin(theta)};
          var orbit2 = {x:r2 * Math.cos(theta), y:r2 * Math.sin(theta)};
          var orbit3 = {x:r3 * Math.cos(theta), y:r3 * Math.sin(theta)};
          var orbit4 = {x:r4 * Math.cos(theta), y:r4 * Math.sin(theta)};
          var orbit5 = {x:r5 * Math.cos(theta), y:r5 * Math.sin(theta)};
          var orbit6 = {x:r6 * Math.cos(theta), y:r6 * Math.sin(theta)};
          var orbit7 = {x:r7 * Math.cos(theta), y:r7 * Math.sin(theta)};

          storageEllipse1.push(orbit1);
          storageEllipse2.push(orbit2);
          storageEllipse3.push(orbit3);
          storageEllipse4.push(orbit4);
          storageEllipse5.push(orbit5);
          storageEllipse6.push(orbit6);
          storageEllipse7.push(orbit7);

          theta += step;
        }
        var max = Math.floor(2*pi/step);
        var sat1_ind = Math.floor(Math.random() * max);
        var count = 0;
        count += isSatOn(storageEllipse1[sat1_ind]);
        var sat2_ind = Math.floor(Math.random() * max);
        count += isSatOn(storageEllipse2[sat2_ind]);
        var sat3_ind = Math.floor(Math.random() * max);
        count += isSatOn(storageEllipse3[sat3_ind]);
        var sat4_ind = Math.floor(Math.random() * max);
        count += isSatOn(storageEllipse4[sat4_ind]);
        var sat5_ind = Math.floor(Math.random() * max);
        count += isSatOn(storageEllipse5[sat5_ind]);
        var sat6_ind = Math.floor(Math.random() * max);
        count += isSatOn(storageEllipse6[sat6_ind]);
        var sat7_ind = Math.floor(Math.random() * max);
        count += isSatOn(storageEllipse7[sat7_ind]);
        var gps_automated_response = count;

        
        function isSatOn(point) {
          var value = 0;
          var test1 = point.x > 0
          if (test1 && (Math.abs(Math.atan(point.y/point.x)) < 1.253)) {
            value = 1
          }
          return value;
        }
        
        // Lines for area of coverage

        var bottomLine = [];
        var midLine1 = [];
        var midLine2 = [];
        var topLine = [];
        var point1 = {x:-600, y:0};
        var point2 = {x:0, y:0};
        var point3 = {x:100, y:-300};
        var point4 = {x:-600, y:-310};
        var point5 = {x:0, y:-310};
        var point6 = {x:100, y:-310};
        var point7 = {x:100, y:310};
        var point8 = {x:-600, y:310};
        var point9 = {x:0, y:310};
        var point10 = {x:100, y:310};

        midLine1.push(point1);
        midLine1.push(point2);
        midLine1.push(point3);
        bottomLine.push(point4);
        bottomLine.push(point5);
        bottomLine.push(point6);
        midLine2.push(point1);
        midLine2.push(point2);
        midLine2.push(point7);
        topLine.push(point8);
        topLine.push(point9);
        topLine.push(point10);

        // create days remaining data structure
        var dataResource = [];
        for (var i = 0; i < 4; i++){
          var dr = days_remaining + Math.floor(Math.random() * 2) - 1;
          dataResource.push(dr)
        }

        // create heatmap points
        // now generate some random data
        var points = [];
        var max = 0;
        var width = 14000;
        var height = 700;
        var len = Math.floor(Math.random()*130);

        while (len--) {
          var val = Math.floor(Math.random()*100);
          // now also with custom radius
          var radius = Math.floor(Math.random()*450);

          max = Math.max(max, val);
          var point = {
            x: Math.floor(Math.random()*width),
            y: Math.floor(Math.random()*height),
            value: val,
            // radius configuration on point basis
            radius: radius
          };
          points.push(point);
        }
        // heatmap data format
        var heatmapData = {
          max: max,
          data: points
        };

        function btnListener(evt){
            evt.target.removeEventListener('click', btnListener);
            if(this.id === "jspsych-instructions-GPS"){
              GPS();
            } else if(this.id === 'jspsych-instructions-Weather'){
              Weather();
            } else if(this.id === 'jspsych-instructions-Resource'){
              Resource();
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
            // The specific evaluation that we want to display
            var trial_used;
            var this_answer;
            if (current_page == 0) {
                trial_used = trial.trial1;
                this_answer = gps_answer;
                if(!enable_questions2){
                  gps_answer = 'viewed'
                }
            } else if (current_page == 1) {
                trial_used = trial.trial2;
                this_answer = weather_answer;
                if(!enable_questions2){
                  weather_answer = 'viewed'
                }
            } else if (current_page == 2) {
                trial_used = trial.trial3;
                this_answer = resource_answer;
                if(!enable_questions2){
                  resource_answer = 'viewed'
                }
            }

            // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
            if (display_element.hasChildNodes()) {
              // can't loop through child list because the list will be modified by .removeChild()
              while (display_element.firstChild) {
                display_element.removeChild(display_element.firstChild);
              }
            }

            // create navigation bar
            var divNav = document.createElement("div");
            divNav.class = 'jspsych-nav-bar';
            divNav.style.backgroundColor = 'white';
            divNav.style.listStyle = 'none';
            divNav.style.textAlign = 'center';
            divNav.style.margin = '0px';
            divNav.style.padding = '25px';
            var allowed_Weather = (current_page == 0 || current_page == 2)? '' : "disabled='disabled'";
            var allowed_GPS = (current_page == 1 || current_page == 2)? '' : "disabled='disabled'";
            var allowed_Resource = (current_page == 0 || current_page == 1)? '' : "disabled='disabled'";
            if (typeof gps_answer !== "undefined") {
              gps_color = 'PaleGreen'
            }
            if (typeof weather_answer !== "undefined") {
              weather_color = 'PaleGreen'
            }
            if (typeof resource_answer !== "undefined") {
              resource_color = 'PaleGreen'
            }
            var GPS_html = "<button id='jspsych-instructions-GPS' class='jspsych-btn' style='background-color:"+gps_color+"; margin-right: 5px;'"+allowed_GPS+">"+trial.button_label_1+"</button>";
            if (num_tabs > 1 && trial.show_page_number) {
                nav_html += pagenum_display;
            }
            var continue_bool = (typeof gps_answer !== "undefined") && (typeof weather_answer !== "undefined") && (typeof resource_answer !== "undefined")
            var allowed_Continue = continue_bool? '' : "disabled='disabled'";
            var allowed_Abort = abort_bool? '' : "disabled='disabled'";
            var abort_color;
            var abort_border;
            if(abort_bool == true){
              abort_color = "red",
              abort_border = "solid"
            } else {
              abort_color = "white",
              abort_border = "none"
            }
            var Weather_html = "<button id='jspsych-instructions-Weather' class='jspsych-btn' style='background-color:"+weather_color+";margin-right: 5px;' "+allowed_Weather+">"+trial.button_label_2+"</button>";
            var Resource_html = "<button id='jspsych-instructions-Resource' class='jspsych-btn' style='background-color:"+resource_color+";margin-right: 5px;' "+allowed_Resource+">"+trial.button_label_3+"</button>";
            var abort_html = "<button id='jspsych-instructions-Abort' class='jspsych-btn' style='background-color: "+abort_color+"; border: "+abort_border+"; margin-right: 150px; border-radius: 50%; font-size: 24px; color:white;'"+allowed_Abort+">"+trial.button_label_abort+"</button>";            var continue_html = "<button id='jspsych-instructions-Continue' class='jspsych-btn' style='background-color: green; margin-left: 150px; border-radius: 50%; font-size: 24px; color:white;'"+allowed_Continue+">"+trial.button_label_continue+"</button>";
            html = abort_html + GPS_html + Weather_html + Resource_html + continue_html
            divNav.innerHTML = html;

            // GPS Satellite Chart if current page = 0
            
            if(current_page==0){
              // create canvas element and image
              var canvas1 = '<canvas id="canvas1" width="800" height="400"></canvas>';
              var div1 = document.createElement("div");
              div1.id = 'topLeft';
              div1.style.width = '1000px';
              div1.style.height = '500px';
              div1.style.float = 'left';
              div1.style.padding = '0px 30px 30px 0px';
              div1.innerHTML = canvas1;

              // add nav bar to screen
              display_element.insertBefore(divNav, null);
              // add canvas to screen and draw image
              display_element.insertBefore(div1, divNav.nextElementSibling);
              const CHART1 = document.getElementById("canvas1");
              let scatterChart1 = new Chart(CHART1, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: "Sat 1 Orbit",
                            fill: false,
                            lineTension: 0.1,
                            showLine: true,
                            backgroundColor: "rgba(0, 0, 128, 1)",
                            borderColor: "rgba(0, 0, 128, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(0, 0, 128, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(0, 0, 128, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: storageEllipse1
                        }, {
                            label: "Sat 2 Orbit",
                            fill: false,
                            lineTension: 0.1,
                            showLine: true,
                            backgroundColor: "rgba(107, 142, 35, 1)",
                            borderColor: "rgba(107, 142, 35, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(107, 142, 35, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(107, 142, 35, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: storageEllipse2
                        }, {
                            label: "Sat 3 Orbit",
                            fill: false,
                            lineTension: 0.1,
                            showLine: true,
                            backgroundColor: "rgba(255, 165, 0, 1)",
                            borderColor: "rgba(255, 165, 0, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(255, 165, 0, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(255, 165, 0, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: storageEllipse3
                        }, {
                            label: "Sat 4 Orbit",
                            fill: false,
                            lineTension: 0.1,
                            showLine: true,
                            backgroundColor: "rgba(255, 69, 0, 1)",
                            borderColor: "rgba(255, 69, 0, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(255, 69, 0, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(255, 69, 0, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: storageEllipse4
                        },{
                            label: "Sat 5 Orbit",
                            fill: false,
                            lineTension: 0.1,
                            showLine: true,
                            backgroundColor: "rgba(218, 112, 214, 1 )",
                            borderColor: "rgba(218, 112, 214, 1 )",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(218, 112, 214, 1 )",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(218, 112, 214, 1 )",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: storageEllipse5
                        },{
                            label: "Sat 6 Orbit",
                            fill: false,
                            lineTension: 0.1,
                            showLine: true,
                            backgroundColor: "rgba(175, 238, 238, 1)",
                            borderColor: "rgba(175, 238, 238, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(175, 238, 238, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(175, 238, 238, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: storageEllipse6
                        },{
                            label: "Sat 7 Orbit",
                            fill: false,
                            lineTension: 0.1,
                            showLine: true,
                            backgroundColor: "rgba(152, 251, 152, 1)",
                            borderColor: "rgba(152, 251, 152, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(152, 251, 152, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(152, 251, 152, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: storageEllipse7
                          },{
                            label: "mid line 1",
                            fill: '+1',
                            lineTension: 0,
                            showLine: false,
                            backgroundColor: "rgba(1, 1, 1, 0.2)",
                            borderColor: "rgba(1, 1, 1, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(107, 142, 35, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(107, 142, 35, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: midLine1
                          },{
                            label: "bottom line",
                            fill: false,
                            lineTension: 0,
                            showLine: false,
                            backgroundColor: "rgba(1, 1, 1, 0.1)",
                            borderColor: "rgba(1, 1, 1, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(107, 142, 35, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(107, 142, 35, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: bottomLine
                          },{
                            label: "mid line 2",
                            fill: '+1',
                            lineTension: 0,
                            showLine: false,
                            backgroundColor: "rgba(1, 1, 1, 0.2)",
                            borderColor: "rgba(1, 1, 1, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(107, 142, 35, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(107, 142, 35, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: midLine2
                          },{
                            label: "top line",
                            fill: false,
                            lineTension: 0,
                            showLine: false,
                            backgroundColor: "rgba(1, 1, 1, 0.1)",
                            borderColor: "rgba(1, 1, 1, 1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(107, 142, 35, 1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 0,
                            pointHoverBackgroundColor: "rgba(107, 142, 35, 1)",
                            pointHoverBorderWidth: 0,
                            pointRadius: 0,
                            pointHitRadius: 10,
                            data: topLine
                          },{
                            data: [{
                                x: 21,
                                y: 0,
                            }],
                            label: 'Planet',
                            pointStyle: 'crossRot',
                            pointBackgroundColor: 'black',
                            pointBorderColor: 'black',
                            backgroundColor: 'black',
                            borderColor: 'black',
                            pointRadius: 8,
                            pointHoverRadius: 8
                          },{
                            data: [{
                                x: 0,
                                y: 0,
                            }],
                            label: 'Planet',
                            pointStyle: 'circle',
                            pointBackgroundColor: 'red',
                            pointBorderColor: 'darkred',
                            backgroundColor: 'red',
                            borderColor: 'darkred',
                            pointRadius: 16,
                            pointHoverRadius: 16
                          },{
                            data: [storageEllipse1[sat1_ind]],
                            label: 'Sat 1 Location',
                            pointStyle: 'circle',
                            pointBackgroundColor: "rgba(0, 0, 128, 1)",
                            pointBorderColor: "rgba(0, 0, 128, 1)",
                            backgroundColor: "rgba(0, 0, 128, 1)",
                            borderColor: "rgba(0, 0, 128, 1)",
                            pointRadius: 7,
                            pointHoverRadius: 7
                            }, {
                            data: [storageEllipse2[sat2_ind]],
                            label: 'Sat 2 Location',
                            pointStyle: 'circle',
                            pointBackgroundColor:  "rgba(107, 142, 35, 1)",
                            pointBorderColor:  "rgba(107, 142, 35, 1)",
                            backgroundColor:  "rgba(107, 142, 35, 1)",
                            borderColor:  "rgba(107, 142, 35, 1)",
                            pointRadius: 7,
                            pointHoverRadius: 7
                            },{
                            data: [storageEllipse3[sat3_ind]],
                            label: 'Sat 3 Location',
                            pointStyle: 'circle',
                            pointBackgroundColor: "rgba(255, 165, 0, 1)",
                            pointBorderColor: "rgba(255, 165, 0, 1)",
                            backgroundColor: "rgba(255, 165, 0, 1)",
                            borderColor: "rgba(255, 165, 0, 1)",
                            pointRadius: 7,
                            pointHoverRadius: 7
                            },{
                            data: [storageEllipse4[sat4_ind]],
                            label: 'Sat 4 Location',
                            pointStyle: 'circle',
                            pointBackgroundColor: "rgba(255, 69, 0, 1)",
                            pointBorderColor: "rgba(255, 69, 0, 1)",
                            backgroundColor: "rgba(255, 69, 0, 1)",
                            borderColor: "rgba(255, 69, 0, 1)",
                            pointRadius: 7,
                            pointHoverRadius: 7
                            }, {
                            data: [storageEllipse5[sat5_ind]],
                            label: 'Sat 5 Location',
                            pointStyle: 'circle',
                            pointBackgroundColor: "rgba(218, 112, 214, 1)",
                            pointBorderColor: "rgba(218, 112, 214, 1)",
                            backgroundColor: "rgba(218, 112, 214, 1)",
                            borderColor: "rgba(218, 112, 214, 1)",
                            pointRadius: 7,
                            pointHoverRadius: 7
                            }, {
                            data: [storageEllipse6[sat6_ind]],
                            label: 'Sat 6 Location',
                            pointStyle: 'circle',
                            pointBackgroundColor: "rgba(175, 238, 238, 1)",
                            pointBorderColor: "rgba(175, 238, 238, 1)",
                            backgroundColor: "rgba(175, 238, 238, 1)",
                            borderColor: "rgba(175, 238, 238, 1)",
                            pointRadius: 7,
                            pointHoverRadius: 7
                            }, {
                            data: [storageEllipse7[sat7_ind]],
                            label: 'Sat 7 Location',
                            pointStyle: 'circle',
                            pointBackgroundColor:"rgba(152, 251, 152, 1)",
                            pointBorderColor: "rgba(152, 251, 152, 1)",
                            backgroundColor: "rgba(152, 251, 152, 1)",
                            borderColor: "rgba(152, 251, 152, 1)",
                            pointRadius: 7,
                            pointHoverRadius: 7
                        }]},
                options: {
                  events: [],
                  animation: {
                    duration: 0
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        color: 'red',
                        display: true,
                        text: 'Kilometers'
                      },
                      min: -600,
                      max: 600
                    },
                    y: {
                      title: {
                        color: 'red',
                        display: true,
                        text: 'Kilometers'
                      },
                      min: -300,
                      max: 300
                    }
                  }
                }
              });
            }
            // Heatmap if current page = 1
            else if(current_page==1){
              var div1 = document.createElement("div");
              div1.id = 'heatmapContainer';
              div1.style.width = '900px';
              div1.style.height = '500px';
              div1.style.float = 'left';
              div1.style.marginBottom = '40px';
              div1.style.backgroundImage = "url(png/mars-topography.png)";
              div1.style.backgroundSize = 'cover';
              // add nav bar to screen
              display_element.insertBefore(divNav, null);
              // add canvas to screen and draw image
              display_element.insertBefore(div1, divNav.nextElementSibling);
              // create canvas element and image
              var config = {
                container: document.getElementById('heatmapContainer'),
                maxOpacity: .3,
                minOpacity: .1,
                gradient: {
                  // enter n keys between 0 and 1 here
                  // for gradient color customization
                  '.3': 'green',
                  '.6': 'yellow',
                  '.8': 'red'
                }
              };
              // create heatmap with configuration
              var heatmapInstance = h337.create(config);
              heatmapInstance.setData(heatmapData);

              xPoints = [0, 59.21, 118.42, 177.63, 236.84, 296.05, 355.26, 414.47, 473.68, 532.89, 592.11, 651.32, 710.53, 769.74, 828.95, 846.71];
              yPoints = [142.86, 136.9, 136.9, 136.9, 136.9, 136.9, 142.86, 142.86, 154.76, 160.71, 172.62, 184.52, 196.43, 220.24, 250, 273.81];
              var intensities = [];
              for(var i=0; i<xPoints.length; i++){
                var value = heatmapInstance.getValueAt({
                  x: xPoints[i],
                  y: yPoints[i]
                });
                intensities.push(value*100/max)
              };
              // x is the number of points that you want to consider in determining risk of a given trajectory
              // for example it could be 4
              // if you want to consider the mean across the entire trajectory use x = 16
              var x = 4;
              var peakIntensities = [];

              function getTopX(x){
                for(var i=0; i<x; i++){
                  var max = Math.max.apply(null, intensities); // get max of array
                  intensities.splice(intensities.indexOf(max),1); // remove max from the array
                  peakIntensities.push(max)
                };
                return peakIntensities
              };
              var topX = getTopX(x);
              var heatingAnswer = average(topX);
              if(heatingAnswer < 7) {
                weather_automated_response = "low";
              } else if(heatingAnswer <36) {
                weather_automated_response = "medium-low";
              } else if(heatingAnswer <57) {
                weather_automated_response = "medium";
              } else if(heatingAnswer <83) {
                weather_automated_response = "medium-high";
              } else {
                weather_automated_response = "high";
              }
            }

            // Resource evaluation chart
            else if(current_page == 2){
              // create canvas element and image
              var canvas1 = '<canvas id="canvas1" width="800" height="400"></canvas>';
              var div1 = document.createElement("div");
              div1.id = 'topLeft';
              div1.style.width = '1000px';
              div1.style.height = '500px';
              div1.style.float = 'left';
              div1.style.padding = '0px 30px 30px 0px';
              div1.innerHTML = canvas1;
              resource_automated_response = Math.min(...dataResource)

              // add nav bar to screen
              display_element.insertBefore(divNav, null);
              // add canvas to screen and draw image
              display_element.insertBefore(div1, divNav.nextElementSibling);
              const CHART2 = document.getElementById("canvas1");
              var myChart = new Chart(CHART2, {
                type: 'bar',
                data: {
                    labels: ['Oxygen', 'Food', 'Water', 'Fuel'],
                    datasets: [{
                        label: 'Days Remaining',
                        data: dataResource,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                  events: [],
                  tooltips: {
                    enabled: false
                  },
                  hover: {
                    mode: null
                  },
                  animation: {
                    duration: 0
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                      y: {
                          beginAtZero: true,
                          title:{
                            display: true,
                            text: "Amount Left in Days"
                          },
                          max: 9
                      }
                  }
                }
              });
            };

            // display buttons if questions are enabled
            if(enable_questions2){
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
              var choices = document.createElement("div");
              choices.class = 'jspsych-nav-bar';
              choices.style.listStyleType = 'none';
              choices.style.textAlign = 'center';
              choices.style.margin = '0px';
              choices.style.padding = '0px';
              choiceHTML = "";
        
              for (var i = 0; i < trial_used.choices.length; i++) {
                //var str = buttons[i].replace(/%choice%/g, trial_used.choices[i]);
                if (this_answer == i) {
                  var button_html = "<button id='jspsych-button"+i+"' class='jspsych-btn' style='margin-right: 5px; background-color: cyan;'>"+trial_used.choices[i]+"</button>";
                  choiceHTML += button_html;
                } else {
                  var button_html = "<button id='jspsych-button"+i+"' class='jspsych-btn' style='margin-right: 5px;'>"+trial_used.choices[i]+"</button>";
                  choiceHTML += button_html;
                }
              }
              choices.innerHTML = choiceHTML;
              // add buttons to screen
              display_element.insertBefore(choices, div1.nextElementSibling);

              // add prompt if there is one
              if (trial_used.prompt !== null) {
                display_element.insertAdjacentHTML('beforeend', trial_used.prompt);
              }
              display_element.querySelector('#jspsych-button0').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button1').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button2').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button3').addEventListener('click', btnListener);
              display_element.querySelector('#jspsych-button4').addEventListener('click', btnListener);
            }

            display_element.querySelector('#jspsych-instructions-GPS').addEventListener('click', btnListener);
            display_element.querySelector('#jspsych-instructions-Weather').addEventListener('click', btnListener);
            display_element.querySelector('#jspsych-instructions-Resource').addEventListener('click', btnListener);
            display_element.querySelector('#jspsych-instructions-Continue').addEventListener('click', btnListener);
            display_element.querySelector('#jspsych-instructions-Abort').addEventListener('click', btnListener);
            
          }
    
          function buttonClick() {
            if (current_page == 0) {
              gps_answer = which
            } else if (current_page == 1) {
              weather_answer = which
            } else if (current_page == 2) {
              resource_answer = which
            }
            show_current_page();
          }
        
          function Weather() {
    
          add_current_page_to_view_history()
    
          current_page = 1;
    
          show_current_page();
    
        }

        function average(values) {
          total = 0;
          for(var i=0; i<values.length; i++) {
            total += values[i]
          };
          return total/values.length
        }
    
        function GPS() {
    
          add_current_page_to_view_history()
    
          current_page = 0;
    
          show_current_page();
        }

        function Resource() {
          add_current_page_to_view_history()
    
          current_page = 2;
    
          show_current_page();
        }
    
        function add_current_page_to_view_history() {
    
          var current_time = performance.now();
    
          var page_view_time = current_time - last_page_update_time;
    
          view_history.push({
            gps_response: gps_answer,
            weather_response: weather_answer,
            resource_response: resource_answer,
            gps_automated_response: gps_automated_response,
            weather_automated_response: weather_automated_response,
            resource_automated_response: resource_automated_response,
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
