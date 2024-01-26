## Running This Code

This study was designed to run using [JATOS](https://jatos.org). However, we include a local version that should also work. To get started, open `ASMM_v1_local.html` in your browser

The following URL parameters are included:
- `version`: the version of the study, each version contains 3 true positive cases, 3 true negative cases, and 4 false cases. `1` and `2` indicate false positive cases, `3` indicates false negative cases.
- `PROLIFIC_PID`: the user id
- `novideo`: to skip the video, the value of this parameter can be anything

## General Structure & JsPsych

The experiment is written in Javascript using a framework called JsPsych, documented here: https://www.jspsych.org/7.2/.
JsPsych structures experiments according to a *timeline*, consisting of a list of nodes, with each node specifying a *plugin*. Each plugin defines a "trial", a screen that is shown to the user and which can take input parameters and emit results (which JsPsych logs). Our experiment uses a mix of built-in JsPsych plugins (like 'html-button-response') and custom-written plugins (detailed below).

Most of the code is defined in main.js. This is invoked through two separate HTML files, ASMM_v1_jatos.html and ASMM_v1_local.html. The local version lets the experiment run and be tested on your own machine; the other allows it to be deployed and integrated with Jatos, the hosting service we used. (Besides the few calls in that file, nothing else relating to Jatos is kept in this repo; that was all Divya's doing.)

Important Files and their Structure

`ASMM_v1_{jatos,local}.html`

As mentioned, these two files mostly exist to drop the main experiment code into a web page, which is all defined in JS.
The files include a header section where we import every individual JS plugin needed to run the experiment; make sure you add new plugins here if you decide to use them. (I can't guarantee everything currently there is actually used.)
The body contains a script call to load a few parameters from the URL line.
Finally, it calls the actual experiment and directs it to save results either locally or through a hook with Jatos.

`main.js`

The main file. This defines hyperparameters for the experiment, encodes the inputs used by the different possible scenarios, decides what order to show them in, assembles the data structure to be fed into JsPsych, defines the timeline that structures the experiment, and finally kicks JsPsych to tell it to run.

Here are as many pointers as I can write down about working with this file:

- There are a number of conditions that can cause us to kick the user out early; these are parameterized by many of the hyperparameters early in the file, generally based on passing some check for some number of rounds.
- The hyperparameters are all in CAPS
- The "scenarios" object defines every input scenario that can be used in a trial. The way the scenarios were produced is described further below. The values defined for each scenario are:
-- id (just a number)
-- satellites_online, weather_intensity, entry_angle - the ground truth classification for the scenario along the three input dimensions
-- ai_judgement, ai_decision - what the AI's answers should be for the first (world state) and second (trajectory) evaluations in the scenario
-- GNG - the ground truth right answer for the team's final decision
-- diff_no_ws, diff_ws - difficulty rating of easy or hard, both in cases of when the user does and does not see the world state
-- chart_answers - a sub-object containing the acceptable answers for each of the trajectory chart subquestions
- The 'weather_slides' and 'gps_slides' structures define specs for each specific slide available to use for each input level. Each slide corresponds to an image, the filename of which is computer later, and the corresponding answers to the two auxiliary questions are encoded here. For the gps slides, the acceptable 'closest satellite' answers are presented as a list. One slide is paired with each scenario further down.
- The video filenames and lengths are encoded in the script; I believe the lengths control when the user is allowed to advance to the next page. Be sure to update these when the videos change.
- The training sequence is fixed; the rest of the trials are permuted from the base order defined on line 743. Both sequences change slightly for the versions where world state is not shown.
- Note the slightly different formats used in the filenames and the internal names for levels and such
- Lines 816-865 compile the scenario definitions, slides, and filenames into everything JsPsych needs to actually display each scenario via the experiment plugins.
- The post-training trial order is determined by rotating the base order by two, times a random integer frm 0-4. This permutation number is logged. This method of ordering was selected to avoid ever having two scenarios in a row where the AI gives an incorrect assessment. An older method of permuting via a latin square is included but is commented out.
- The timeline is a nested data structure of arrays and objects. The root is an array, containing 'nodes'. Each node specifies what plugin 'type' it uses, any inputs needed by that plugin, and optionally a function for what to do with any data it returns. By default, all returned data is logged by JsPsych.
- Inputs are frequently assigned via "jsPsych.timelineVariable", which prompts JsPsych to pull that value from the input data constructed previously.
- Timeline nodes can also be "conditional" nodes that define optional parts of the timeline, as well as loops. In both of these cases, a subtimeline is included as the body.
- The Timeline and TimelineVars documentation pages are both good to read on the JsPsych site
- The section that sets up the timeline is built in two stages: First, specific nodes are defined, then the actual timeline structure is built (starting at line 1112).
- The actual call that makes JsPsych do something interesting is located at the very end, "jsPsych.init"

jspsych/plugins/jspsych-trial-of-trials2.js
This is one of two major custom plugins. It defines the screen that displays the world state to the user.
- The plugin.info section is required and defines the inputs the plugin expects to receive from the timeline.
- plugin.*questions and plugin.colors are just storage globals for convenience
- plugin.trial is the main function that JsPsych calls when the plugin is run. It passes "display_element", which is an HTML element that we can manipulate to display things, and "trial" which is the input variables for this trial (and some other things). In this particular case, we do some foolery to call a separate function, since some elements of this plugin take a minute to load (particularly in an older version)

- load_trial does most of the real work. Basically, the plugin creates a bunch of web page elements and assigns function calls to a few of the buttons, and strategically disables some of them to force the user to complete the task before moving on.

-- The major objects are "divNav" (the navigation bar containing the buttons to access each pane, and the Continue button), "assessDiv" (the extra panel that pops up after hitting "Continue"), and the "display_page" function (which redraws the screen in response to a navigation button and shows that page)

-- The auxiliary questions are created in their own divs, in a special funciton. Worth reading.

-- The control flow is handled by attaching "satisfied" variables to specific buttons and giving them references to the items that need to be checked to determine satisfaction. "CheckSatisfy" functions are included in the button handlers, which check these conditions and handle changing button colors and enabling/disabling the button to continue.

-- The "endTrial" function handles returning data to JsPsych

-- You can ignore trial-of-trials.js and trial-of-trials3.js and any other variant; they're old

`jspsych/plugins/jspsych-entry-chart.js`

Similarly, this plugin creates a set of html elements from data that's passed in and controls the enabled state and appearance of the continue button and the displaying of the assessment buttons via callback functions.

`final-decision` and `judgement-feedback`.

These smaller plugins handle giving the AI's feedback at both evaluation step and in getting the human's final decision.

## Generating the Scenarios

The scenarios were generated in conjuncion with a matlab script written before my time. It accepts a set of inputs along each of the three input dimensions and uses them to forward-integrate a descent trajectory, making fixed assumptions about the initial velocity, control scheme during descent, and flight characteristics of the craft. It reports the outcome of this integration as a set of 6 charts, which I chopped up into the individual images that are loaded here.
Based on the charts, we subjectively evaluated the go/no-go status of each trajectory and the proper responses for each chart, as well as the difficulty of these decisions.
The world state images were generated after the fact. Originally these were generated in-code using drawing functions and the heatmap.js tool to produce images that were in line with our own interpretations of the input parameter levels. After our first run of the experiment, we concluded that this induced too much randomness and inhibited reproducibility, so we captured a handful of screenshots of each level and removed that code.
The old code should still be accessible if you go back far enough in the git history.

## Contact

For any questions, reach out to Jack Kolb `[kolb@gatech.edu]`, Divya Srivastava `[divya.srivastava@gatech.edu]`, or Mason Lilly `[jmlilly4@gmail.com]`.
