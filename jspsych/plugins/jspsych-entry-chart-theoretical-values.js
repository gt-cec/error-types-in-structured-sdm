/*
 * Example plugin template
 */

jsPsych.plugins["entry-chart-theoretical-values"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "entry-chart-theoretical-values",
    parameters: {
      // Don't know what parameters I need here yet
      parameter1: {
        type: jsPsych.plugins.parameterType.BOOL, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: false
      },
      parameter2: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      gps_automated_response: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'GPS Answer',
        default: undefined,
        description: 'Calculated number of GPS satellites online.'
      },
      weather_automated_response: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Weather Answer',
        default: undefined,
        description: 'Calculated risk of complications due to adverse weather.'
      },
      resource_automated_response: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Resource Answer',
        default: undefined,
        description: 'Calculated days remaining of limiting resource.'
      },
      output_type_theoretical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Output Type',
        default: undefined,
        description: 'Nature of trajectory plots. By default they are based on initial evaluation results. Other options are always good ("always-good") or always bad ("always-bad").'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // Get Entry Heating Characteristics
    var finalHeight;
    var maxHeating = 0;
    var maxAccel = 0;
    var totalHeating = 0;
    var touchdownDisplacement;
    var ellipseWidth;
    var ellipseHeight;

    // Planetary Parameters - Current Planet: Mars
    var pi = 3.1415926535;
    var e = 2.71828;
    var Mu = 4.282837e15; // Gravitational Parameter, m^3/s^2, here Mars
    var rplanet = 3396.2 * 1000; // Surface Radius of planet, m, here Mars
    var Vc = (Mu/rplanet)**.5;  // Circular Speed, m/s
    var Vatm = Vc * 1.4; // Atmpospheric interface velocity, also V0, m/2
    var rho0 = 0.02; // Surface Density, kg/m^3, for Mars
    var hatm = 125*1000; // Atmospheric Interface Height, m, approximate for Mars
    var scaleHeight = 11.1*1000; // Planetary Scaleheight, m, here Mars
    var g0 = 3.71; // Surface Gravitational Acceleration, m/s^2, for Neptune
    var T = 0; // Thrust, N
    var Epsilon = 0; // Thrust Angle from Flight Path
    var siderealRotationPeriod = 24.6229; // hours, here for Neptune (Magnetic coordinates)
    var omega = 2*pi/(siderealRotationPeriod*60*60); // Planetary rotation rate, here Mars
    var test = 0;
    var desiredLat = 1;
    var desiredLong = 11;
    var jsonDesired = {x: desiredLong, y: desiredLat}
    var test = 0; // for bank angle  control law
    var heatingK = 1.9027e-4; // kg^.5/m for Mars from https://tfaws.nasa.gov/TFAWS12/Proceedings/Aerothermodynamics%20Course.pdf
    // Aerodynamic Coefficients
    var mass = 2000; // Mass of vehicle, kg
    var B = 157; // Vehicle Ballistic Coefficient, kg/m^2
    var LoverD = 1; // L/D Ratio, 0 for ballistic entry
    var Rn = .6; // effective nose cone radius

    // Vector Set Up, Initial Conditions, and Numerical Integration
    // Time
    var endTime = 250; // s, Max time for numerical integration
    var delta = .1; // s, Increment for numerical integration
    var instances = endTime / delta; // number of increments in total time
    // Density
    var rho = new Array(instances).fill(0);
    rho[0] = rho0*(e**(-hatm/scaleHeight));
    // Velocity
    var velocity = new Array(instances).fill(0);
    velocity[0] = Vatm;
    var acceleration = new Array(instances-1).fill(0);
    // Height
    var heights = new Array(instances).fill(0);
    heights[0] = hatm;
    // Gravity
    var gs = new Array(instances).fill(0)
    gs[0] = g0 * (rplanet**2)/((rplanet + hatm)**2);
    // Flight Path Angle
    var gammas = new Array(instances).fill(0)
    gammas[0] = -10; // degrees
    // Bank Angle
    var sigma0 = 45; // bang angle Initital Condition
    var sigma = new Array(instances).fill(0); // degrees
    sigma[0] = sigma0
    // side path angle
    var psi0 = 0;
    var psi = new Array(instances).fill(0); // degrees
    psi[0] = psi0;
    // Longitude
    var theta0 = 0; // Initial Longitude condition
    var theta = new Array(instances).fill(0)
    theta[0] = theta0;
    // Latitude
    var phi0 = 0; // Initial Lattitude condition
    var phi = new Array(instances).fill(0)
    phi[0] = phi0;

    // Storage variables for JS Chart
    var runningSum = 0; // used to add store the integrated heat load values
    var storageVelocityvHeight = [];
    var storageAcceleration  = [];
    var storageBankAngle = [];
    var storagePeakHeating = [];
    var storageIntegratedHeating = [];

    var minDistance = 100000; // initial condition for finding closest point to desired touchdown location
    var touchdownTest = false;

    // Numerical Integration Loop
    var scalingFactor;
    var weatherUncertainty;
    var weather;
    console.log(weather_automated_response);
    console.log(output_type);
    if(weather_automated_response == 'low' || output_type_theoretical == 'always-good'){
      weather = false
      weatherUncertainty = 0;
    } else if(weather_automated_response == 'medium-low'){
      weather = true;
      scalingFactor = 45000;
      weatherUncertainty = .5;
    } else if(weather_automated_response == 'medium'){
      weather = true;
      scalingFactor = 20000;
      weatherUncertainty = 1;
    } else if(weather_automated_response == 'medium-high'){
      weather = true;
      scalingFactor = 3500;
      weatherUncertainty = 1.5;
    } else if(weather_automated_response == 'high' || output_type_theoretical == 'always-bad'){
      weather = true;
      scalingFactor = 2000;
      weatherUncertainty = 2;
    }

    for(i = 1; i < instances-1; i++) {
      if(heights[i-1]<60000 && weather) {
        rho0 = 0.02 * ((60000-heights[i-1])/scalingFactor + 1);
      };
      if(velocity[i-1] < 1200) {
        rho0 = .001;
      }
      // K1s
      r = rplanet + heights[i-1];
      K1v = Kvel(T,Epsilon,mass,rho[i-1],velocity[i-1],B,gs[i-1],gammas[i-1],omega,r,phi[i-1],psi[i-1]);
      K1gam = Kgamma(T,Epsilon,mass,rho[i-1],velocity[i-1],B,gs[i-1],gammas[i-1],omega,r,phi[i-1],psi[i-1],sigma[i-1],LoverD);
      K1h = Kheight(velocity[i-1],gammas[i-1]);
      K1theta = Ktheta(velocity[i-1],gammas[i-1],psi[i-1],r,phi[i-1]);
      K1phi = Kphi(velocity[i-1],gammas[i-1],psi[i-1],r);
      K1psi = Kpsi(T,Epsilon,mass,rho[i-1],velocity[i-1],B,gammas[i-1],omega,r,phi[i-1],psi[i-1],sigma[i-1],LoverD);

      // second step updates
      velocity2 = velocity[i-1] + (K1v * delta/2);
      gamma2 = gammas[i-1] + K1gam * delta/2;
      h2 = heights[i-1] + K1h*delta/2;
      theta2 = theta[i-1] + K1theta * delta/2;
      phi2 = phi[i-1] + K1phi * delta/2;
      psi2 = psi[i-1] + K1psi * delta/2;
      rho2 = rho0*(e**(-h2/scaleHeight));
      r2 = rplanet + h2;
      g2 = g0 * (rplanet**2)/(r2**2);
      // K2s
      K2v = Kvel(T,Epsilon,mass,rho2,velocity2,B,g2,gamma2,omega,r2,phi2,psi2);
      K2gam = Kgamma(T,Epsilon,mass,rho2,velocity2,B,g2,gamma2,omega,r2,phi2,psi2,sigma[i-1],LoverD);
      K2h = Kheight(velocity2,gamma2);
      K2theta = Ktheta(velocity2,gamma2,psi2,r2,phi2);
      K2phi = Kphi(velocity2,gamma2,psi2,r2);
      K2psi = Kpsi(T,Epsilon,mass,rho2,velocity2,B,gamma2,omega,r2,phi2,psi2,sigma[i-1],LoverD);

      // third step updates
      velocity3 = velocity[i-1] + (K2v * delta/2);
      gamma3 = gammas[i-1] + K2gam * delta/2;
      h3 = heights[i-1] + K2h*delta/2;
      theta3 = theta[i-1] + K2theta * delta/2;
      phi3 = phi[i-1] + K2phi * delta/2;
      psi3 = psi[i-1] + K2psi * delta/2;
      rho3 = rho0*(e**(-h3/scaleHeight));
      r3 = rplanet + h3;
      g3 = g0 * (rplanet**2)/(r3**2);
      // K3s
      K3v = Kvel(T,Epsilon,mass,rho3,velocity3,B,g3,gamma3,omega,r3,phi3,psi3);
      K3gam = Kgamma(T,Epsilon,mass,rho3,velocity3,B,g3,gamma3,omega,r3,phi3,psi3,sigma[i-1],LoverD);
      K3h = Kheight(velocity3,gamma3);
      K3theta = Ktheta(velocity3,gamma3,psi3,r3,phi3);
      K3phi = Kphi(velocity3,gamma3,psi3,r3);
      K3psi = Kpsi(T,Epsilon,mass,rho3,velocity3,B,gamma3,omega,r3,phi3,psi3,sigma[i-1],LoverD);

      // fourth step updates
      velocity4 = velocity[i-1] + (K3v * delta);
      gamma4 = gammas[i-1] + K3gam * delta;
      h4 = heights[i-1] + K3h*delta;
      theta4 = theta[i-1] + K3theta * delta;
      phi4 = phi[i-1] + K3phi * delta;
      psi4 = psi[i-1] + K3psi * delta;
      rho4 = rho0*(e**(-h4/scaleHeight));
      r4 = rplanet + h4;
      g4 = g0 * (rplanet**2)/(r4**2);
      // K4s
      K4v = Kvel(T,Epsilon,mass,rho4,velocity4,B,g4,gamma4,omega,r4,phi4,psi4);
      K4gam = Kgamma(T,Epsilon,mass,rho4,velocity4,B,g4,gamma4,omega,r4,phi4,psi4,sigma[i-1],LoverD);
      K4h = Kheight(velocity4,gamma4);
      K4theta = Ktheta(velocity4,gamma4,psi4,r4,phi4);
      K4phi = Kphi(velocity4,gamma4,psi4,r4);
      K4psi = Kpsi(T,Epsilon,mass,rho4,velocity4,B,gamma4,omega,r4,phi4,psi4,sigma[i-1],LoverD);

      // Iteration
      acceleration[i-1] = (1/6) * (K1v + 2*K2v + 2*K3v + K4v);
      velocity[i] = velocity[i-1] + (delta/6) * (K1v + 2*K2v + 2*K3v + K4v);
      gammas[i] = gammas[i-1] + (delta/6) * (K1gam + 2*K2gam + 2*K3gam + K4gam);
      psi[i] = psi[i-1] + (delta/6) * (K1psi + 2*K2psi + 2*K3psi + K4psi);
      heights[i] = heights[i-1] + (delta/6) * (K1h + 2*K2h + 2*K3h + K4h);
      theta[i] = theta[i-1] + (delta/6) * (K1theta + 2*K2theta + 2*K3theta + K4theta);
      phi[i] = phi[i-1] + (delta/6) * (K1phi + 2*K2phi + 2*K3phi + K4phi);  
      gs[i] = g0 * (rplanet**2)/(rplanet + heights[i])**2;
      rho[i] = rho0*(e**(-heights[i]/scaleHeight));
      neededTrajectory = Math.atan(desiredLat-phi[i])/(desiredLong-theta[i]) * (180/pi); // degrees
      bankReturn = bankAngle(sigma[i-1],neededTrajectory,psi[i-1],test);
      test = bankReturn[0];
      sigma[i] = bankReturn[1];
      var qDotS = (heatingK * ((rho[i]/Rn)**.5) * (velocity[i]**3))/1000000
      runningSum += qDotS * delta
      if(qDotS > maxHeating) {
        maxHeating = qDotS
      }
      if(delta*(velocity[i]-velocity[i-1])/(-9.81) > maxAccel){
        maxAccel = (delta*(velocity[i]-velocity[i-1])/(-9.81))
      }
      var json1 = {x: velocity[i]/1000, y: heights[i]/1000}
      distance = ((theta[i] - desiredLong)**2 + (phi[i]-desiredLat)**2)**.5
      if(distance < .1 && !touchdownTest) {
        touchdownTest = true
      }
      if(!touchdownTest){
        var json2 = {x: theta[i], y: phi[i]}
        storageBankAngle.push(json2);
      }
      if(heights[i] > 100){
        var json4 = {x:i*delta, y:runningSum};
        storageIntegratedHeating.push(json4);
      }
      var json3 = {x:qDotS, y:heights[i]/1000}
      var json5 = {x:delta*(velocity[i]-velocity[i-1])/(-9.81), y:heights[i]/1000}
      storageVelocityvHeight.push(json1);
      storagePeakHeating.push(json3);
      storageAcceleration.push(json5);
    }

    //  create landing ellipse data
    console.log(gps_automated_response)
    var scaleFactor;
    if(gps_automated_response < 3){
      scaleFactor = 5 + weatherUncertainty
    } else if(gps_automated_response == 3){
      scaleFactor = 2 + weatherUncertainty
    } else if(gps_automated_response == 4) {
      scaleFactor = 1.5 + weatherUncertainty
    } else {
      scaleFactor = 1 + weatherUncertainty
    }

    console.log(scaleFactor)
    var a = scaleFactor*(50+(Math.random(20)-10));
    var b = scaleFactor*(100+(Math.random(40)-20));  //Math.random adds some stochasticity
    var theta = 0;
    var step = .01;
    var storageEllipse1 = [];
    var storageEllipse2 = [];
    var storageEllipse3 = [];
    var rMax = 0;
    while(theta < 2*pi) {
      r1 = a*b / ((b*Math.sin(theta))**2 + (a*Math.cos(theta))**2)**.5;
      r2 = a*b*(1.2**2) / ((b*Math.sin(theta))**2 + (a*Math.cos(theta))**2)**.5;   
      r3 = a*b*(1.2**4) / ((b*Math.sin(theta))**2 + (a*Math.cos(theta))**2)**.5;  
      //calculate the max radius value, should be along the x-axis 
      if(r3>rMax){
        rMax = r3;
      }
      var json6 = {x:r1 * Math.cos(theta), y:r1 * Math.sin(theta)};
      var json7 = {x:r2 * Math.cos(theta), y:r2 * Math.sin(theta)};;
      var json8 = {x:r3 * Math.cos(theta), y:r3 * Math.sin(theta)};
      storageEllipse1.push(json6);
      storageEllipse2.push(json7);
      storageEllipse3.push(json8);
      theta += step;
    }
    var maxValue = 400;
    if(rMax > 375){
      maxValue = Math.round(((rMax * 1.1)/100 + 1))*100;
    }

    finalHeight = heights[heights.length - 1];
    totalHeating = runningSum;
    ellipseWidth = b;
    ellipseHeight = a;
    touchdownDisplacement = distance;

    end_trial();

    // store response
    var response = {
      rt: null,
      button: null
    };

    // helper functions for numerical integration
    function Kvel(T,eps,m,rho,vel,B,g,gamma,omega,r,phi,psi) {
      var term1 = T * cosd(eps)/m;
      var term2 = -rho* (vel**2) / (2 * B);
      var term3 = -g * sind(gamma);
      var term4 = (omega**2) * r * cosd(phi) * (sind(gamma)*cosd(phi) - cosd(gamma)*sind(phi)*sind(psi));
      var K = term1 + term2 + term3 + term4;
      return K
    };

    function Ktheta(vel,gamma,psi,r,phi) {
      var K = (vel * cosd(gamma) * cosd(psi) / (r * cosd(phi)))* (180/pi);
      return K
    };

    function Kpsi(T,eps,m,rho,vel,B,gamma,omega,r,phi,psi,sigma,LoverD) {
      var term1 = T * sind(eps) * sind(sigma)/(vel * m * cosd(gamma));
      var term2 = (rho*vel/(2*B)) * LoverD * (sind(sigma)/cosd(gamma));
      var term3 = -vel*cosd(gamma)*cosd(psi)*tand(phi)/r;
      var term4 = 2 * omega * (tand(gamma)*cosd(phi)*sind(psi) - sind(phi));
      var term5 = omega**2 * r * sind(phi)*cosd(phi)*cosd(psi)/(vel*cosd(gamma));
      var K = (term1 + term2 + term3 + term4 + term5)*(180/pi);
      return K
    };

    function Kphi(vel,gamma,psi,r) {
      var K = (vel * cosd(gamma) * sind(psi) / r)*(180/pi);
      return K
    };

    function Kheight(vel,gamma) {
      var K = vel * sind(gamma);
      return K
    };

    function Kgamma(T,eps,m,rho,vel,B,g,gamma,omega,r,phi,psi,sigma,LoverD) {
      var term1 = T * sind(eps)*cosd(sigma)/(vel*m);
      var term2 = vel * cosd(gamma)/r;
      var term3 = rho * vel * LoverD * cosd(sigma)/(2 * B);
      var term4 = -g * cosd(gamma)/vel;
      var term5 = 2 * omega * cosd(phi)*cosd(psi);
      var angleTerm = cosd(gamma)*cosd(phi) + sind(gamma) * sind(phi) * sind(psi);
      var term6 = omega**2 * r * cosd(phi) * angleTerm / vel;
      var K = (term1 + term2 + term3 + term4 + term5 + term6);
      return K
    };

    function bankAngle(current,needed,actual,testIN) {
      var check = needed - actual;
      var testOut = 0;
      if((check >= -.4 && check <= .4) || testIN == 1) {
        var newAngle = 0;
        var testOut = 1;
      } else {
        var newAngle = current;
      }
      return [testOut, newAngle]
    };

    function cosd(degrees) {
      return Math.cos(degrees*pi/180)
    };
    
    function sind(degrees) {
      return Math.sin(degrees*pi/180)
    };

    function tand(degrees) {
      return Math.tan(degrees*pi/180)
    }

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        stimulus: trial.stimulus,
        finalHeight: finalHeight,
        maxHeating: maxHeating,
        maxAccel: maxAccel,
        totalHeating: totalHeating,
        touchdownDisplacement: touchdownDisplacement,
        ellipseWidth: ellipseWidth,
        ellipseHeight: ellipseHeight
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };
  };

  return plugin;
})();
