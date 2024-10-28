class MyObject {
    constructor(id, position, velocity, mass, radius) {
        this.id = id;
        this.DOMObject = document.getElementById(this.id);
        this.DOMObject.onclick = this.colorChange;
  
        this.position = position;
  
        this.width = radius;
        this.height = radius;
        this.DOMObject.style.height = this.height / border.y_domain * border.height + 'px';
        this.DOMObject.style.width = this.width / border.x_domain * border.width + 'px';
        this.mass = mass;
        this.x_velocity = velocity[0];
        this.y_velocity = velocity[1];
    }
    colorChange(){
        let color_index = Math.floor(Math.random() * colors.length);
        document.getElementById(this.id).style.backgroundColor = colors[color_index];
    }
    getDOMObject(){
        this.DOMObject = document.getElementById(this.id);
        return this.DOMObject;
    }
    applyForces(){
        let a_x = (-border.resistance_c * this.x_velocity - this.position[0] * border.elasticity_c) / this.mass;
        
        this.x_velocity += a_x * DELTA_T;
    }
    move(){
        this.applyForces();
        
        this.position = this.getNewPosition();

        this.updateView();
    }
    updateView() {
        let [x, y] = this.position;
        
        if (x + this.width * 2 >= border.x_domain) {
            border.x_domain_start = -x - this.width * 2;
            border.x_domain = x + this.width * 2;
            border.y_domain = border.x_domain;
            border.y_domain_start = border.x_domain_start;
        }
  
        border.resize();
  
        this.DOMObject.style.top = (y - this.height / 2 - border.y_domain_start) / (border.y_domain - border.y_domain_start) * border.height + 'px';
        this.DOMObject.style.left = (x - border.x_domain_start) / (border.x_domain - border.x_domain_start) * border.width + 'px';
    
        this.DOMObject.style.height = this.height / (border.y_domain - border.y_domain_start) * border.height + 'px';
        this.DOMObject.style.width = this.width / (border.x_domain - border.x_domain_start) * border.width + 'px';
  
    }
    getNewPosition() {
        return [
            this.position[0] + this.x_velocity * DELTA_T,
            this.position[1] + this.y_velocity * DELTA_T
        ];
    }
    
    checkCollisionWithBorder() {
        let new_position = this.getNewPosition();
        if (new_position[1] < 0 && this.y_velocity < 0){
            this.y_velocity *= -1;
            return true;
        }
    }
}