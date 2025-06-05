class Animal {
    constructor(name, breed) {
      this.name = name;
      this.breed = breed
    }
  
    information() {
      return this.name + ' is a ' + this.breed;
    }
  }
  
  const dog1 = new Animal("Emma", "poodle")

  console.log(dog1.information()); // -> Emma is a poodle
  
