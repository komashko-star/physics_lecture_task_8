var colors = ['silver', 'gray', 'white', 'maroon', 'red',
  'purple', 'fuchsia', 'green', 'lime', 'olive',
  'yellow', 'navy', 'blue', 'teal', 'aqua']

const DELTA_T = 0.01;
const MAX_Y_DOMAIN = 10;
  
var border = null;
objects = []
var x_chart = null;
var energy_chart = null;
var spring = null;

function polarToRect(a, phi) {
  return [a * Math.cos(phi), a * Math.sin(phi)];
}

function innerWidth(node) {
  var computedStyle = getComputedStyle(node);

  let width = node.clientWidth;

  width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  return width;
}

class Border {
  constructor(id, resistance_c, elasticity_c){
    this.id = id;
    this.DOMObject = document.getElementById(this.id);

    this.resistance_c = resistance_c;
    this.elasticity_c = elasticity_c;
    this.x_domain_start = -MAX_Y_DOMAIN;
    this.x_domain = MAX_Y_DOMAIN;
    this.y_domain_start = -MAX_Y_DOMAIN;
    this.y_domain = MAX_Y_DOMAIN;
    this.width = 0;

    this.resize();
  }
  getDOMObject(){
    this.DOMObject = document.getElementById(this.id);
    return this.DOMObject;
  }
  resize() {
    let width = innerWidth(this.getDOMObject());
    if (width == this.width) {
      return
    }
    this.width = width;
    this.height = this.width / (this.x_domain - this.x_domain_start) * (this.y_domain - this.y_domain_start);
    this.DOMObject.style.height = Math.round(this.height) + 'px';
    this.DOMObject.style.width = Math.round(this.width) + 'px';
  }
}

class Spring {
  constructor(id, start_x, width){
    this.id = id;
    this.DOMObject = document.getElementById(this.id);

    this.start_x = start_x;
    this.width = width;

    this.updateView(0);
  }
  getDOMObject(){
    this.DOMObject = document.getElementById(this.id);
    return this.DOMObject;
  }

  updateView(new_x) {
    let center_x = Math.min(this.start_x, new_x);
      
    this.DOMObject.style.top = (-this.width / 2 - border.y_domain_start) / (border.y_domain - border.y_domain_start) * border.height + 'px';
    this.DOMObject.style.left = (center_x - border.x_domain_start) / (border.x_domain - border.x_domain_start) * border.width + 'px';

    this.DOMObject.style.height = (this.width) / (border.y_domain - border.y_domain_start) * border.height + 'px';
    this.DOMObject.style.width = Math.abs(this.start_x - new_x) / (border.x_domain - border.x_domain_start) * border.width + 'px';
  }
}


is_moving = true;
next_step = false;
counter = 1;

setInterval(() => {
  if (is_moving || next_step) {
    objects.forEach(element => {
      element.move();
    });
    next_step = false;
  }

  return;
}, DELTA_T * 1000)

  
function makeCharts(velocity, deltax, resistance_c, elasticity_c, mass) {
    function xAcceleration(v, x) {
        return (-resistance_c * v - elasticity_c * x) / mass;
    }

    tValues = [0];

    xValues = [deltax];
    xVelocityValues = [velocity];
    xAccelerationValues = [xAcceleration(velocity, deltax)];
    kineticEnergyValues = [velocity * velocity * mass / 2];
    potentialEnergyValues = [elasticity_c * deltax * deltax / 2];
    totalEnergyValues = [kineticEnergyValues[0] + potentialEnergyValues[0]];

    let dt = 0.01;
    for (let t = dt; t <= 5; t += dt) {
        xAccelerationValues.push(xAcceleration(xVelocityValues[xVelocityValues.length - 1], xValues[xValues.length - 1]));

        xVelocityValues.push(xVelocityValues[xVelocityValues.length - 1] + dt * xAccelerationValues[xAccelerationValues.length - 1]);
        xValues.push(xVelocityValues[xVelocityValues.length - 1] * dt + xValues[xValues.length - 1]);

        potentialEnergyValues.push(elasticity_c * xValues[xValues.length - 1] * xValues[xValues.length - 1] / 2);
        kineticEnergyValues.push(mass * xVelocityValues[xVelocityValues.length - 1] * xVelocityValues[xValues.length - 1] / 2);
        totalEnergyValues.push(kineticEnergyValues[kineticEnergyValues.length - 1] + potentialEnergyValues[potentialEnergyValues.length - 1]);

        tValues.push(t.toFixed(3));
    }

    if (x_chart != null) {
        x_chart.destroy();
    }
    x_chart = new Chart("x_chart", {
        type: "line",
        data: {
        labels: tValues,
        datasets: [{
            label: "Дальность x, м",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(255,0,0,0.5)",
            data: xValues
        }, {
            label: "Скорость v_x, м/с",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(0,0,255,0.5)",
            data: xVelocityValues
        }, {
            label: "Ускорение a_x, м/с^2",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(0,255,0,0.5)",
            data: xAccelerationValues
        }]
        },
    });
    if (energy_chart != null) {
        energy_chart.destroy();
    }
    energy_chart = new Chart("energy_chart", {
        type: "line",
        data: {
        labels: tValues,
        datasets: [{
            label: "Кинетическая энергия E_к, Дж",
            fill: true,
            pointRadius: 1,
            borderColor: "rgba(255,0,0,0.5)",
            data: kineticEnergyValues
        }, {
            label: "Потенциальная энергия U, Дж",
            fill: true,
            pointRadius: 1,
            borderColor: "rgba(0,0,255,0.5)",
            data: potentialEnergyValues
        }, {
            label: "Полная энергия E_мех, Дж",
            fill: true,
            pointRadius: 1,
            borderColor: "rgba(0,255,0,0.5)",
            data: totalEnergyValues
        }]
        },
    });

}


function reloadModel(velocity, deltax, resistance_c, elasticity_c, mass, radius) {
    counter = 1;
    objects = [];
    border = new Border('border', resistance_c, elasticity_c);
    border.getDOMObject().innerHTML = "<div id=\"object1\"> </div><div id=\"spring\"> </div>";
    
    var my_object1 = new MyObject('object1', [deltax, 0], [velocity, 0], mass, radius);
    objects.push(my_object1);

    spring = new Spring('spring', 0, radius / 2);

    makeCharts(velocity, deltax, resistance_c, elasticity_c, mass);
}


function reloadForm() {
  const mass = parseFloat(document.getElementById('mass').value);
  const deltax = parseFloat(document.getElementById('deltax').value);

  const velocity = parseFloat(document.getElementById('velocity').value);
  const resistance_c = parseFloat(document.getElementById('resistance_c').value);
  const elasticity_c = parseFloat(document.getElementById('elasticity_c').value);

  let radius = 1;

  reloadModel(
    velocity,
    deltax,
    resistance_c,
    elasticity_c,
    mass,
    radius
  );
}





window.onload = () => {
  const checkbox = document.getElementById('stop_simulation');
        
  checkbox.addEventListener('change', function() {
    is_moving = 1 - is_moving;
  });    
  const next_step_button = document.getElementById('next_step_simulation');    
  next_step_button.onclick = function() {
    next_step = true;
  };

  
  reloadForm();

  document.getElementById('collisionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    reloadForm();
  });

}
