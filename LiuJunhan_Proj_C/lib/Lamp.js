var Lamp = function(){
    this.gl = false;
    this.lampPos  = new Float32Array(3); // x,y,z in world coords
    this.lampAmbi = new Float32Array(3); // r,g,b for ambient illumination
    this.lampDiff = new Float32Array(3); // r,g,b for diffuse illumination
    this.lampSpec = new Float32Array(3); // r,g,b for specular illumination
    this.lampEmis = new Float32Array(3); // r,g,b for emissive illumination
    this.u_LampPos = false;
    this.u_LampAmbi = false;
    this.u_LampDiff = false;
    this.u_LampSpec = false;
    this.u_LampEmis = false;

};

Lamp.prototype = {

    initLamp_Pos_Ambi_Diff_Spec : function(GL,uniformLampPos,uniformLampAmbi,uniformLampDiff,uniformLampSpec){
      this.gl = GL;
      if(!this.gl){
        console.log('Failed te get gl');
        return;
      }

      this.u_LampPos  = this.gl.getUniformLocation(this.gl.program, uniformLampPos);
      this.u_LampAmbi  = this.gl.getUniformLocation(this.gl.program, uniformLampAmbi);
      this.u_LampDiff  = this.gl.getUniformLocation(this.gl.program, uniformLampDiff);
      this.u_LampSpec  = this.gl.getUniformLocation(this.gl.program, uniformLampSpec);

      if(!this.u_LampPos || !this.u_LampAmbi || !this.u_LampDiff || !this.u_LampSpec){
        console.log('Failed to get u_LampPos, u_LampAmbi, u_LampDiff and/or u_LampSpec');
        return;
      }

      return this;

    },

    initLamp_Emis: function(GL, uniformLampEmis){
      this.gl = GL;
      if(!this.gl){
        console.log('Failed te get gl');
        return;
      }

      this.u_LampEmis  = this.gl.getUniformLocation(this.gl.program, uniformLampEmis);

      if( !this.u_LampEmis){
        console.log('Failed to get u_LampEmis');
        return;
      }

      return this;

    },



    setPos: function(position){
      this.lampPos.set(position);
      if(!this.gl){
        console.log('Failed te get gl');
        return;
      }

      if( !this.u_LampPos){
        console.log('Failed to get u_LampPos');
        return;
      }
    
      this.gl.uniform3fv(this.u_LampPos, this.lampPos);      
      return this;
    },

    getPos: function(){
      return this.lampPos;
    },


    setAmbi: function(ambient){
      this.lampAmbi.set(ambient);
      if(!this.gl){
        console.log('Failed te get gl');
        return;
      }

      if( !this.u_LampAmbi){
        console.log('Failed to get u_LampAmbi');
        return;
      }
      
      this.gl.uniform3fv(this.u_LampAmbi, this.lampAmbi);    
      return this;
    },

    getAmbi: function(){
      return this.lampAmbi;
    },

    setDiff: function(diffuse){
      this.lampDiff.set(diffuse);
      if(!this.gl){
        console.log('Failed te get gl');
        return;
      }

      if( !this.u_LampDiff){
        console.log('Failed to get u_LampDiff');
        return;
      }
      
      this.gl.uniform3fv(this.u_LampDiff, this.lampDiff);     
      return this;
    },

    getDiff: function(){
      return this.lampDiff;
    },

    setSpec: function(specular){
      this.lampSpec.set(specular);
      if(!this.gl){
        console.log('Failed te get gl');
        return;
      }

      if( !this.u_LampSpec){
        console.log('Failed to get u_LampSpec');
        return;
      }

      this.gl.uniform3fv(this.u_LampSpec, this.lampSpec);     
      return this;
    },

    getSpec: function(){
      return this.lampSpec;
    },

    setEmis: function(emissive){
      this.lampEmis.set(emissive);
      if(!this.gl){
        console.log('Failed te get gl');
        return;
      }

      if( !this.u_LampEmis){
        console.log('Failed to get u_LampEmis');
        return;
      }
      
      this.gl.uniform3fv(this.u_LampEmis, this.lampEmis);     
      return this;
    },

    getEmis: function(){
      return this.lampEmis;
    },

    turnOn: function(){
      if(!this.gl){
          console.log('Failed te get gl');
          return;
      }

      if(!this.u_LampPos|| !this.u_LampAmbi || !this.u_LampDiff || !this.u_LampSpec){
          console.log('Failed to get u_LampPos, u_LampAmbi, u_LampDiff, u_LampSpec');
          return;
      }

      this.gl.uniform3fv(this.u_LampPos, this.lampPos); 
      this.gl.uniform3fv(this.u_LampAmbi, this.lampAmbi);
      this.gl.uniform3fv(this.u_LampDiff, this.lampDiff);
      this.gl.uniform3fv(this.u_LampSpec, this.lampSpec);

      if(this.u_LampEmis){
        this.gl.uniform3fv(this.u_LampEmis, this.lampEmis);
      } 

      return this;

    },

    turnOff: function(){
      if(!this.gl){
          console.log('Failed te get gl');
          return;
      }

      if(!this.u_LampPos|| !this.u_LampAmbi || !this.u_LampDiff || !this.u_LampSpec){
          console.log('Failed to get u_LampPos, u_LampAmbi, u_LampDiff, u_LampSpec');
          return;
      }

      this.gl.uniform3fv(this.u_LampPos, this.lampPos); 
      this.gl.uniform3fv(this.u_LampAmbi, [0,0,0]);
      this.gl.uniform3fv(this.u_LampDiff, [0,0,0]);
      this.gl.uniform3fv(this.u_LampSpec, [0,0,0]);

      if(this.u_LampEmis){
        this.gl.uniform3fv(this.u_LampEmis, [0,0,0]);
      } 

      return this;

    },

  };