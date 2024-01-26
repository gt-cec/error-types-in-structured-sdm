ASMM_Experiment =
{
    run: function(version=null, subject_id=null, handleResults=null, novideo=false)
    {
        // HYPERPARAMETERS AND GLOBAL VARIABLES
        var timeline = [];

        let VIDEO_CONTROLS = false
        let MIN_AUX_CORRECT = 2
        let MAX_SPEED_FAILS = 3
        let MAX_AUX_FAILS = 1
        let MAX_TASK_FAILS = 1
        let SPEED_TEST_ROUNDS = 6
        let AUX_TEST_ROUNDS = 3
        let TASK_TEST_ROUNDS = 3

        var human_judgement=false;
        var human_opinion=false;
        var human_decision=false; //human's final call after AI consultation
        var confidence=false; //human's final call after AI consultation
        var speed_fails=0; // how many times they've been warned about speeding through the trials
        var task_fails=0;
        var aux_fails=0;
        var trial_count=0;

        if(version == null)
            version = 4;
            //version = jsPsych.randomization.sampleWithoutReplacement([0,1,2,3,4,5],1)[0];
        else if(version < 0)
            throw 'version must be >=0!'
        else if(version > 5)
            throw 'version must be <=5!'
        console.log('version '+version)
        if(subject_id == null)
            subject_id = 'test'

        // Define global variables

        /*
        VERSION DESCRIPTIONS:
        0 - Control - Presented with trajectories, go/no-go only
        1 - Trajectory interaction - Presented with trajectories, asked to rate each one before gng
        2 - World State Visible - Shown world state, shown trajectories, gng, MM examination
        3 - World State Visible, Trajectory Interaction" - Shown world state, shown trajectories, rate each trajectory, gng, MM examination
        4 - World State Visible, World State Interaction - Shown world state, given guiding questions about world state, shown trajectories, gng, MM examination
        5 - Whole Shebang - Shown world state, given guiding questions, shown trajectories, rate each trajectory, gng, MM examination
        */

        //store, screen to screen, each teammate's opinion on continuing

        // INPUT DATA

        var scenarios = 
        [
            {
                "id": 1,
                "satellites_online": "2 or less",
                "weather_intensity": "high",
                "entry_angle": "steep",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "no-go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Bad"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Bad"]
                }
            },
            {
                "id": 2,
                "satellites_online": "2 or less",
                "weather_intensity": "none",
                "entry_angle": "steep",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "no-go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Bad"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Good"]
                }
            },
            {
                "id": 3,
                "satellites_online": "3",
                "weather_intensity": "none",
                "entry_angle": "medium",
                "ai_judgement": "good",
                "ai_decision": "go",
                "GNG": "go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Good"]
                }
            },
            {
                "id": 4,
                "satellites_online": "3",
                "weather_intensity": "none",
                "entry_angle": "shallow",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "no-go",
                "diff_no_ws": "easy",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Maybe", "Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Bad"],
                    "lat_long": ["Bad"],
                    "landing_conf": ["Good"]
                }
            },
            {
                "id": 5,
                "satellites_online": "2 or less",
                "weather_intensity": "high",
                "entry_angle": "medium",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "no-go",
                "diff_no_ws": "difficult",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe", "Bad"],
                    "landing_conf": ["Bad"]
                }
            },
            {
                "id": 6,
                "satellites_online": "2 or less",
                "weather_intensity": "med",
                "entry_angle": "medium",
                "ai_judgement": "bad",
                "ai_decision": "go",
                "GNG": "no-go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe", "Bad"],
                    "landing_conf": ["Bad"]
                }
            },
            {
                "id": 7,
                "satellites_online": "4",
                "weather_intensity": "none",
                "entry_angle": "med-steep",
                "ai_judgement": "good",
                "ai_decision": "go",
                "GNG": "go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Good"]
                }
            },
            {
                "id": 8,
                "satellites_online": "4",
                "weather_intensity": "high",
                "entry_angle": "medium",
                "ai_judgement": "bad",
                "ai_decision": "go",
                "GNG": "go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe", "Bad"],
                    "landing_conf": ["Maybe", "Bad"]
                }
            },
            {
                "id": 9,
                "satellites_online": "3",
                "weather_intensity": "med",
                "entry_angle": "shallow",
                "ai_judgement": "bad",
                "ai_decision": "go",
                "GNG": "no-go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Maybe", "Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Bad"],
                    "lat_long": ["Bad"],
                    "landing_conf": ["Maybe"]
                }
            },
            {
                "id": 10,
                "satellites_online": "4",
                "weather_intensity": "none",
                "entry_angle": "medium",
                "ai_judgement": "good",
                "ai_decision": "go",
                "GNG": "go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Good"]
                }
            },
            {
                "id": 11,
                "satellites_online": "2 or less",
                "weather_intensity": "low",
                "entry_angle": "medium",
                "ai_judgement": "good",
                "ai_decision": "go",
                "GNG": "go",
                "diff_no_ws": "easy",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe", "Bad"],
                    "landing_conf": ["Maybe", "Good"]
                }
            },
            {
                "id": 12,
                "satellites_online": "3",
                "weather_intensity": "high",
                "entry_angle": "medium",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "no-go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe","Bad"],
                    "landing_conf": ["Bad"]
                }
            },
            {
                "id": 13,
                "satellites_online": "5 or more",
                "weather_intensity": "high",
                "entry_angle": "shallow",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "no-go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Maybe", "Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Bad"],
                    "lat_long": ["Maybe", "Bad"],
                    "landing_conf": ["Maybe", "Bad"]
                }
            },
            {
                "id": 14,
                "satellites_online": "3",
                "weather_intensity": "med",
                "entry_angle": "med-steep",
                "ai_judgement": "bad",
                "ai_decision": "go",
                "GNG": "no-go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Maybe", "Bad"]
                }
            },
            {
                "id": 15,
                "satellites_online": "5 or more",
                "weather_intensity": "none",
                "entry_angle": "medium",
                "ai_judgement": "good",
                "ai_decision": "go",
                "GNG": "go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Good"],
                    "heating": ["Good"],
                    "heat_load": ["Maybe"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Good"]
                }
            },
            {
                "id": 16,
                "satellites_online": "3",
                "weather_intensity": "low",
                "entry_angle": "med-steep",
                "ai_judgement": "good",
                "ai_decision": "go",
                "GNG": "go",
                "diff_no_ws": "difficult",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Maybe", "Good"]
                }
            },
            {
                "id": 17,
                "satellites_online": "2 or less",
                "weather_intensity": "med",
                "entry_angle": "med-steep",
                "ai_judgement": "bad",
                "ai_decision": "go",
                "GNG": "no-go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Maybe", "Bad"]
                }
            },
            {
                "id": 18,
                "satellites_online": "4",
                "weather_intensity": "high",
                "entry_angle": "med-steep",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "no-go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Maybe", "Bad"]
                }
            },
            {  // Addition for Experiment 3 -- difficult FN; 2orlessLowMedsteep
                "id": 19,
                "satellites_online": "2 or less",
                "weather_intensity": "none",
                "entry_angle": "med-steep",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Maybe", "Good"]
                }
            },
            {  // Addition for Experiment 3 -- difficult FN; 3LowMedsteep
                "id": 20,
                "satellites_online": "3",
                "weather_intensity": "none",
                "entry_angle": "med-steep",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Maybe", "Good"]
                }
            },
            {  // Addition for Experiment 3 -- difficult FN; 4MedhighMedsteep
                "id": 21,
                "satellites_online": "4",
                "weather_intensity": "med",
                "entry_angle": "med-steep",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "go",
                "diff_no_ws": "difficult",
                "diff_ws": "difficult",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Good"],
                    "landing_conf": ["Good"]
                }
            },
            {  // Addition for Experiment 3 -- easy FN; 5ormoreMedMedsteep
                "id": 22,
                "satellites_online": "5 or more",
                "weather_intensity": "low",
                "entry_angle": "med-steep",
                "ai_judgement": "bad",
                "ai_decision": "no-go",
                "GNG": "go",
                "diff_no_ws": "easy",
                "diff_ws": "easy",
                "chart_answers":
                {
                    "height_vel": ["Good"],
                    "accel": ["Maybe"],
                    "heating": ["Maybe"],
                    "heat_load": ["Good"],
                    "lat_long": ["Maybe", "Good"],
                    "landing_conf": ["Maybe", "Good"]
                }
            }
        ]

        weather_slides =
        {
            "none":
            [
                {
                    "id": 1,
                    "q1": "None",
                },
                {
                    "id": 2,
                    "q1": "None",
                },
                {
                    "id": 3,
                    "q1": "None",
                },
                {
                    "id": 4,
                    "q1": "None",
                },
                {
                    "id": 5,
                    "q1": "None",
                },
                {
                    "id": 6,
                    "q1": "None",
                }
            ],
            "low":
            [
                {
                    "id": 1,
                    "q1": "Low",
                },
                {
                    "id": 2,
                    "q1": "Low",
                },
                {
                    "id": 3,
                    "q1": "Low",
                },
                {
                    "id": 4,
                    "q1": "Low",
                }
                // {
                //     "id": 5,
                //     "q1": "Low",
                //     "q2": "Low"
                // }
            ],
            "med":
            [
                {
                    "id": 1,
                    "q1": "Medium",
                },
                // {
                //     "id": 2,
                //     "q1": "Medium",
                //     "q2": "Medium"
                // },
                // {
                //     "id": 3,
                //     "q1": "Medium",
                //     "q2": "Medium"
                // },
                {
                    "id": 4,
                    "q1": "Medium",
                },
                {
                    "id": 5,
                    "q1": "Medium",
                }
                // {
                //     "id": 6,
                //     "q1": "High",
                //     "q2": "Medium"
                // }
            ],
            "high":
            [
                {
                    "id": 1,
                    "q1": "High",
                },
                {
                    "id": 2,
                    "q1": "High",
                },
                {
                    "id": 3,
                    "q1": "High",
                },
                {
                    "id": 4,
                    "q1": "High",
                },
                {
                    "id": 5,
                    "q1": "High",
                },
                // {
                //     "id": 6,
                //     "q1": "High",
                //     "q2": "med"
                // },
                {
                    "id": 7,
                    "q1": "High",
                }
            ]
        }

        gps_slides =
        {
            "2 or less":
            [
                {
                    "id": "2orless_1",
                    "q1": "2 or less"
                },
                {
                    "id": "2orless_2",
                    "q1": "2 or less"
                },
                {
                    "id": "2orless_3",
                    "q1": "2 or less"
                },
                {
                    "id": "2orless_4",
                    "q1": "2 or less"
                },
                {
                    "id": "2orless_5",
                    "q1": "2 or less"
                },
                {
                    "id": "2orless_6",
                    "q1": "2 or less"
                }
                // {
                //     "id": "2orless_7",
                //     "q1": ["Gold"],
                //     "q2": "2 or less"
                // }
            ],
            "3":
            [
                {
                    "id": "3_1",
                    "q1": "3"
                },
                {
                    "id": "3_2",
                    "q1": "3"
                },
                {
                    "id": "3_3",
                    "q1": "3"
                },
                {
                    "id": "3_4",
                    "q1": "3"
                },
                {
                    "id": "3_5",
                    "q1": "3"
                },
                {
                    "id": "3_6",
                    "q1": "3"
                }
                // {
                //     "id": "3sats_7",
                //     "q1": ["Red"],
                //     "q2": "3"
                // },
                // {
                //     "id": "3sats_8",
                //     "q1": ["Red"],
                //     "q2": "3"
                // }
            ],
            "4":
            [
                {
                    "id": "4_1",
                    "q1": "4"
                },
                {
                    "id": "4_2",
                    "q1": "4"
                },
                {
                    "id": "4_3",
                    "q1": "4"
                },
                {
                    "id": "4_4",
                    "q1": "4"
                },
                {
                    "id": "4_5",
                    "q1": "4"
                },
                {
                    "id": "4_6",
                    "q1": "4"
                }
                // {
                //     "id": "4sats_7",
                //     "q1": ["Light Blue", "Gold"],
                //     "q2": "4"
                // },
                // {
                //     "id": "4sats_8",
                //     "q1": ["Light Blue", "Gold"],
                //     "q2": "4"
                // }
            ],
            "5 or more":
            [
                {
                    "id": "5_1",
                    "q1": "5 or more"
                },
                {
                    "id": "5_2",
                    "q1": "5 or more"
                }
                // {
                //     "id": "5ormore_7",
                //     "q1": ["Red"],
                //     "q2": "5 or more"
                // },
                // {
                //     "id": "5ormore_8",
                //     "q1": ["Red"],
                //     "q2": "5 or more"
                // }
            ]
        }

        // Filenames by case, for the first and second instruction videos
        let VIDEO_DIR="video/"
        let video_filenames =
        [
            ["", "", "world_state_V2_V3.mp4", "world_state_V2_V3.mp4", "world_state_V4_V5.mp4", "world_state_V4_V5.mp4"],
            ["trajectory_V0.mp4", "trajectory_V1.mp4", "trajectory_V2_V4.mp4", "trajectory_V3_V5.mp4", "trajectory_V2_V4.mp4", "trajectory_V3_V5.mp4"]
        ]
        for(var i=0; i<6;i++)
        {
            video_filenames[0][i] = VIDEO_DIR+video_filenames[0][i]
            video_filenames[1][i] = VIDEO_DIR+video_filenames[1][i]
        }
        let video_lengths = 
        [
            [0,0,224,224,230,230],
            [246,256,252,262,252,262]
        ]

        // Orders to show trials in
        let training_sequence =
            version == 1 ?
            [14, 0, 7, 6, 15, 3] :

            version == 2 || version == 3 ?
            [14, 0, 7, 6, 15, 4] :

            // no version specified
            [];
        
        // base order for the test sequence; will be permuted
        let base_order =
            version == 1 ?
            // false positive version 1
            [4, 10, 5, 2, 13, 1, 16, 9, 11, 8] :     

            version == 2 ?
            // false positive version 2
            [3, 1, 5, 2, 13, 12, 16, 9, 10, 8] :

            version == 3 ?
            // the false negative mode keeps the True Negative cases (2, 4, 13), keeps the True Positive cases (3, 10, 11), and replaces the False Positive cases (6, 9, 14, 17) with False Negative cases (19, 20, 21, 22)
            // note that these are indexes, so scenario-1
            [1, 3, 12, 18, 19, 20, 21, 2, 9, 10] :

            // no version specified
            [];

        // HELPER FUNCTIONS

        function check_alert_effort(rt, min_rt)
        {
            if(rt < min_rt)
            {
                alert('Take your time! Responses that appear rushed will be discarded')
                if(training_rounds-SPEED_TEST_ROUNDS <= trial_count < training_rounds)
                    speed_fails++;
            }
            return false
        }
        function format_gps_filename(level, id)
        {
            let dir =
            {   //map scenario labels to directory names
                "2 or less": "2orless",
                "3": "3",
                "4": "4",
                "5 or more": "5ormore",
            }[level]
            return "png/abs_high/gps/"+dir+"/"+id+".png"
        }
        function format_weather_filename(level, id)
        {   // weather happens to be easier
            return "png/abs_high/weather/"+level+"/"+level+id+".png"
        }
        function format_angle_filename(level)
        {
            let fname =
            {
                "shallow": "shallow",
                "medium": "med",
                "med-steep": "medsteep",
                "steep": "steep"
            }[level]
            return "png/abs_high/angle/"+fname+".png"
        }
        function format_chart_filenames(gps, weather, angle)
        {
            let gps_part =
            {
                "2 or less": "2orless",
                "3": "3",
                "4": "4",
                "5 or more": "5ormore"
            }[gps]
            let weather_part =
            {   // NOTE: we shifted our names for weather levels since the original
                // files were named, thus the remapping
                "none": "Low",
                "low": "Med",
                "med": "Medhigh",
                "high": "High"
            }[weather]
            let angle_part =
            {
                "shallow": "Shallow",
                "medium": "Med",
                "med-steep": "Medsteep",
                "steep": "Steep"
            }[angle]
            let paths = []
            for (let i=0; i<6; i++)
                paths.push("png/trajectory_imgs/All/"+gps_part+weather_part+angle_part+"-"+i+".png")
            return paths
        }

        // SELECT AND ASSEMBLE INPUT SEQUENCE

        let scenario_vars = []

        let weathers_used = {'none': 0, 'low': 0, 'med': 0, 'high': 0}
        let sats_used = {'2 or less': 0, '3': 0, '4': 0, '5 or more': 0}
        for(let i=0; i<scenarios.length; i++)
        {
            let scenario = scenarios[i]
            let vars = {}
            let gps = scenario['satellites_online']
            let weather = scenario['weather_intensity']
            let angle = scenario['entry_angle']
            let gps_slide = gps_slides[gps][sats_used[gps]] // don't reuse images
            let weather_slide = weather_slides[weather][weathers_used[weather]]
            sats_used[gps] = (sats_used[gps] + 1) % gps_slides[gps].length
            weathers_used[weather] = (weathers_used[weather] + 1) % weather_slides[weather].length

            vars['gps_filename'] = format_gps_filename(gps, gps_slide['id'])
            vars['weather_filename'] = format_weather_filename(weather, weather_slide['id'])
            vars['angle_filename'] = format_angle_filename(angle)
            vars['gps_image_id'] = gps_slide['id']
            vars['weather_image_id'] = weather_slide['id']
            vars['chart_filenames'] = format_chart_filenames(gps, weather, angle)
            vars['difficulty'] = (version<2)? scenario['diff_no_ws'] : scenario['diff_ws']
            //vars['furthest_satellite'] = gps_slide['q1']
            vars['satellites_online'] = gps_slide['q1'] // count answer
            vars['weather_intensity'] = weather_slide['q1'] // path intensity
            //vars['regional_intensity'] = weather_slide['q2']
            vars['entry_angle'] =
            {
                'shallow': '9.5',
                'medium': '11',
                'med-steep': '12.5',
                'steep': '14',
            }[angle]
            vars['angle_rating'] =
            {
                'shallow': 'Acceptable',
                'medium': 'Optimal',
                'med-steep': 'Optimal',
                'steep': 'Acceptable'
            }[angle]

            vars['id'] = scenario['id']
            vars['ai_judgement'] = scenario['ai_judgement']=='good'
            vars['ai_decision'] = scenario['ai_decision']=='go'
            vars['GNG'] = scenario['GNG']=='go'
            vars['chart_answers'] = scenario['chart_answers']
            
            scenario_vars.push(vars)
        }
        console.log(scenario_vars)
        
        // Compile scenario order
        // Set training order

        // Old method was: assemble a latin square and pick a row
        // New method: rotate by 2 each time, for K/2 total permutations
        let K = base_order.length
        var permutation = Math.floor(Math.random()*K/2)
        console.log('order permutation: '+permutation)

        let test_sequence = (()=>
        {
            let rotations = []
            for (let i=0; i<K; i++)
            {
                rotations.push(base_order.slice())
                base_order.push(base_order.shift())
            }
            return rotations[(permutation*2)%K] // *2 to pick an even one, %K to stay in range
        })()
        
        // Javacsript is a cartoon language for clown people, why the heck does + not concatenate arrays?
        // let full sequence = training_sequence + test_sequence
        let full_sequence = [...training_sequence, ...test_sequence]
        // full_sequence = [full_sequence[0]]

        let sequence_variables = []
        for (let i=0; i<full_sequence.length; i++)
        {
            sequence_variables.push(scenario_vars[full_sequence[i]])
        }
        console.log(sequence_variables)

        // DEFINE TIMELINE COMPONENTS

        function rough_text_page (text)
        {   
            return {
                type: 'instructions',
                pages: ['<p>'+text+'</p>'],
                show_clickable_nav: true,
                post_trial_gap: 500,
                allow_backward: false
            }

        }

        let world_state_element =
        {
            type: 'trial-of-trials2',
            satellite_image: jsPsych.timelineVariable('gps_filename'),
            weather_image: jsPsych.timelineVariable('weather_filename'),
            angle_image: jsPsych.timelineVariable('angle_filename'),
            enable_questions: version>=4,
            on_finish: function(data)
            {
                human_judgement = data.assess_safe
                data['gps_image_id'] = jsPsych.timelineVariable('gps_image_id')
                data['weather_image_id'] = jsPsych.timelineVariable('weather_image_id')

                check_alert_effort(data.rt, version<4?3000:10000)
                if(version>=4)
                {
                    // Parse and log auxiliary question responses
                    let q_names = []
                    for (var channel of ['gps', 'weather', 'angle'])
                        for (var i of ['1'])
                            q_names.push(channel+'_q'+i);
                    
                    let tvar_names =
                    ['satellites_online',
                    'weather_intensity',
                    'angle_rating']
                    tvar_names.forEach((item, index)=>
                    {
                        data['t_'+q_names[index]] = jsPsych.timelineVariable(item)
                    }); // t_gps_q1, etc
                    
                    let data_names =
                    ['gps_count_response',
                    'weather_path_response',
                    'angle_rating_response']
                    data_names.forEach((item, index)=>
                    {
                        data['a_'+q_names[index]] = data[item]
                        delete data[item]
                    });

                    let correctness = {}
                    let correct = (truth, answer) => ((truth instanceof Array)?
                        truth.includes(answer) : truth == answer);

                    for (var q_name of q_names)
                        correctness['c_'+q_name] = correct(data['t_'+q_name],
                                                           data['a_'+q_name]);
                    let num_correct = 0
                    for (var key in correctness)
                        if (correctness[key])
                            num_correct++

                    Object.assign(data, correctness)
                    data['ws_qs_correct'] = num_correct
                    
                    if (training_rounds-AUX_TEST_ROUNDS <= trial_count && trial_count < training_rounds && num_correct < MIN_AUX_CORRECT)
                    {
                        aux_fails++;
                    }
                }
            }
        }

        var entry_chart =
        {
            type: 'entry-chart',
            ai_judgement: jsPsych.timelineVariable('ai_judgement'),
            human_judgement: function() {return human_judgement},
            //pass from global
            show_judgement: version>=2,
            chart_paths: jsPsych.timelineVariable('chart_filenames'), //list of paths
            show_questions: version%2==1,
            on_finish: function(data)
            {
                human_opinion = data.recommend_execute

                if (version%2==1)
                {
                    let correct = (truth, answer) => (truth instanceof Array)?
                        truth.includes(answer) : truth == answer;
                    let chart_answers = jsPsych.timelineVariable('chart_answers')
                    let num_correct = 0
                    let names =
                    ['heating', // NOTE: must match the order they're actually displayed in
                    'height_vel', // Which is really just determined by the numbering of the filenames
                    'accel',
                    'heat_load',
                    'lat_long',
                    'landing_conf']
                    names.forEach((item, index)=>
                    {
                        let t = chart_answers[item]
                        let a = data['chart'+(index+1)+'_response']
                        let c = correct(t, a)
                        delete data['chart'+(index+1)+'_response']
                        data['t_chart'+(index+1)] = t
                        data['a_chart'+(index+1)] = a
                        data['c_chart'+(index+1)] = c
                        if (c) num_correct++
                    });
                    data['traj_charts_correct'] = num_correct
                }
                console.log(data.rt)
                check_alert_effort(data.rt, version%2==0?2000:7000)
            }
        }

        let judgement_feedback =
        {
            type: "judgement-feedback",
            ai_judgement: jsPsych.timelineVariable('ai_judgement'),
            human_judgement: function(){return human_judgement},
        };
        
        let final_decision =
        {
            type: "final-decision",
            ai_judgement: jsPsych.timelineVariable('ai_judgement'), // judgements may be omitted in versions 0, 1
            human_judgement: function(){return human_judgement},
            show_judgement: version>=2,
            ai_opinion: jsPsych.timelineVariable('ai_decision'),
            human_opinion: function(){return human_opinion},
            on_finish: function(data)
            {
                human_decision = data.final_execute
                confidence = data.confidence
            }
        }

        let decision_feedback =
        {
            type: 'html-button-response',
            choices: ['Continue'],
            stimulus: function()
            {
                if (trial_count < training_rounds)
                {
                    if(human_decision)
                        return '<span style="color:'+(jsPsych.timelineVariable('GNG')? '#00dd00">Landing successful!':'#dd0000">Landing failed!')+'</span>'
                    else
                        return '<span style="color:'+(jsPsych.timelineVariable('GNG')? '#888800">Aborted (HINT: In this case, the landing would have succeeded!)':'#008800">Aborted (Good job!)')+'</span>'
                }
                else if (trial_count < training_rounds+testing_rounds-1)
                    return "Next trial..."
                else
                    return "Experiment complete!"
            },
            on_finish: function(data)
            {
                if (training_rounds-TASK_TEST_ROUNDS <= trial_count && trial_count < training_rounds && human_decision != jsPsych.timelineVariable('GNG'))
                {
                    task_fails++;
                }
            }
        };

        // BUILD TIMELINE

        var training_rounds = training_sequence.length
        var testing_rounds = test_sequence.length

        var experimental_procedure = {
            on_timeline_start: ()=>
            {   //Loop initialize
                trial_count=0
            },
            timeline_variables: sequence_variables,
            timeline: [ //Main timeline
                {
                    //Iteration start
                    type: 'html-keyboard-response',
                    choices: jsPsych.NO_KEYS,
                    trial_duration: 1,
                    stimulus: '',
                    on_finish: ()=>
                    {
                        human_decision = undefined // clear this just for sanity
                    },
                },
                {   // 1st-iteration intro message
                    conditional_function: ()=>{return trial_count==0},
                    timeline:
                    [
                        {
                            type: 'html-button-response',
                            stimulus: "Thank you for participating in this study! Please make sure your audio is on. Let's get started.",
                            choices: ["Continue"],
                        },
                    ],
                },
                {   // 2nd-iteration and-so-on message
                    conditional_function: ()=>{return trial_count==1},
                    timeline:
                    [
                        {
                            type: 'html-button-response',
                            stimulus: 'You will now complete several more trials to practice the task.',
                            choices: ['Continue']
                        }
                    ],
                },
                {   // Main-study-begin message and success check
                    conditional_function: ()=>{return trial_count==training_rounds},
                    timeline:
                    [
                        {
                            type: 'html-button-response',
                            stimulus: "Now let's begin the study!",
                            choices: ['Continue']
                        }
                    ],
                },
                {   // World state display in most versions
                    conditional_function: ()=>{return version>=2},
                    timeline:
                    [
                        {   // 1st-iteration instruction video
                            conditional_function: ()=>{return !novideo && trial_count==0},
                            timeline:
                            [
                                {
                                    type: 'video-button-response',
                                    stimulus: [video_filenames[0][version]],
                                    width: 1000,
                                    choices: ['Continue'],
                                    prompt: //'<p><b>Hover your mouse over the video and click to start the instructions.</b></p>'+
                                    '<p><b>Press "Continue" when you have completed the instructions and are ready to move on to the experiment.</b></p>',
                                    autoplay: true,
                                    controls: VIDEO_CONTROLS,
                                    response_allowed_while_playing: false,
                                    stop: video_lengths[0][version] // length of the video in seconds
                                }
                            ],
                        },
                        world_state_element,
                        // post-world-state AI feedback
                        judgement_feedback,
                    ],
                },
                {   // 1st-iteration video tutorial
                    conditional_function: ()=>{return !novideo && trial_count==0},
                    timeline:
                    [
                        {
                            type: 'video-button-response',
                            stimulus: [video_filenames[1][version]],
                            width: 1000,
                            choices: ['Continue'],
                            prompt: //'<p><b>Hover your mouse over the video and click to start the instructions.</b></p>'+
                            '<p><b>Press "Continue" when you have completed the instructions and are ready to move on to the experiment.</b></p>',
                            autoplay: true,
                            controls: VIDEO_CONTROLS,
                            response_allowed_while_playing: false,
                            stop: video_lengths[1][version] // length of the video in seconds
                        },
                    ],
                },
                entry_chart,
                final_decision,
                decision_feedback,
                {
                    conditional_function: ()=>
                    {   // Final iteration thank you message
                        return trial_count==sequence_variables.length-1
                    },
                    timeline: [rough_text_page('Thank you!')],
                },
                {
                    //Iteration finish; on_timeline_finish doesn't work with timelineVars
                    type: 'html-keyboard-response',
                    choices: jsPsych.NO_KEYS,
                    trial_duration: 1,
                    stimulus: '',
                    on_finish: ()=>
                    {
                        if (trial_count == training_rounds-1)
                            if (speed_fails > MAX_SPEED_FAILS || aux_fails > MAX_AUX_FAILS || task_fails > MAX_TASK_FAILS)
                                jsPsych.endExperiment('Thank you for participating in this experiment! Unfortunately you did not pass the training session. Please complete a quick survey, after which you will be compensated for your time and returned to Prolific.');
                        trial_count++;
                    },
                    data:
                    {
                        'scenario_id': jsPsych.timelineVariable('id'),
                        'satellites_online': jsPsych.timelineVariable('satellites_online'),
                        'weather_intensity': jsPsych.timelineVariable('weather_intensity'),
                        'entry_angle': jsPsych.timelineVariable('entry_angle'),
                        'ai_judgement': jsPsych.timelineVariable('ai_judgement'),
                        'ai_decision': jsPsych.timelineVariable('ai_decision'),
                        'gng': jsPsych.timelineVariable('GNG'),
                        'version': version,
                        'order_permutation': permutation,
                        'PROLIFIC_PID': subject_id,
                    },
                },
                {
                    conditional_function: ()=>{return trial_count==training_rounds},
                    timeline:
                    [
                        {
                            type: 'html-button-response',
                            stimulus: "You've performed well enough in the training rounds to proceed to the actual experiment. We expect this to take an additional 20 minutes, and you will be compensated with a bonus payment depending on your score. If you do not wish to participate in the actual experiment, you will be compensated for your time thus far and return to Prolific. Do you wish to proceed?",
                            choices: ['Yes, continue', 'No, finished'],
                            on_finish: (data)=>
                            {
                                console.log(data)
                                if (data.response == 1)
                                    jsPsych.endExperiment('Thank you!');
                            },
                        },
                    ],
                },
            ],
        }

        timeline.push(experimental_procedure)

        if(handleResults == null)
            handleResults = (results)=>{}

        // MAGIC HAPPENS HERE

        jsPsych.init({
            timeline: timeline,
            override_safe_mode: false,
            show_preload_progress_bar: true,    
            use_webaudio: false,
            on_finish: function() {
                let results = jsPsych.data.get();
                handleResults(results)
            }
        });
    }
}
