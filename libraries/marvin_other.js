//Todo:
// Add support for different things than numbers (like text, audio, image/video, etc.)

const activationFunctions = {
  SIGMOID: 1,
  TANH: 2,
  RELU: 3
};

class neuron {
  constructor(layernr, neuronnr) {
    this.layer = parseInt(layernr);
    this.neuron = parseInt(neuronnr);
    this.weight = [];
    this.bias = [];
    this.activation = 0;
    this.lastActivation = 0;
  }

  setWeight(input, input2) {
    if (!input2) this.weight = input;
    else this.weight[input] = input2;
    return this;
  }

  setBias(input) {
    this.bias = input;
    return this;
  }

  addWeight(input) {
    this.weight.push(input);
  }

  log() {
    console.log(this);
  }
}

class network {
  constructor(structure, lr) {
    if (structure) {
      if (typeof structure == "string") {
        this.activationFunction = activationFunctions.SIGMOID;
        this.learningRate = 1;
        this.network = [];
        this.load(structure, lr);
      } else {
        // Error handling
        let error = false;
        if (structure.length < 2) {
          console.error("The input array should consist of at least 2 entries");
          error = true;
        }
        if (!Array.isArray(structure)) {
          console.error("Please check if the input is an array");
          error = true;
        }
        if (error) process.exit();

        this.activationFunction = activationFunctions.SIGMOID;

        if (lr) this.learningRate = lr;
        else this.learningRate = 1;

        // Create network and store in 'this.network'
        this.network = [];
        for (let i in structure) {
          i = parseInt(i);
          let _amount = structure[i];
          let _layer = [];
          for (let j = 0; j < _amount; j++) {
            let _n = new neuron(i, j);
            for (let k in this.network[i - 1]) {
              _n.addWeight(Math.random() * 2 - 1);
            }
            _n.bias = (Math.random() * 2 - 1);
            _layer.push(_n);
          }
          this.network.push(_layer);
        }
      }
    } else {
      this.activationFunction = activationFunctions.SIGMOID;
      this.learningRate = 1;
      this.network = [];
    }
  }

  log() {
    for (let layernr in this.network) {
      for (let neuronnr in this.network[layernr]) {
        let n = this.network[layernr][neuronnr];
        n.log();
      }
    }
  }

  getNeuron(layernr, neuronnr) {
    layernr = parseInt(layernr);
    neuronnr = parseInt(neuronnr);
    let error = false;
    if (layernr >= this.network.length) {
      console.error(`Layer ${layernr} doesn't exist`);
      error = true;
    }
    if (!error && layernr < 0) layernr = this.network.length + layernr;
    if (!error && neuronnr >= this.network[layernr].length || !error && neuronnr < 0) console.error("That neuron doesn't exist");

    if (error) process.exit();
    return this.network[layernr][neuronnr];
  }

  getLayer(layernr) {
    layernr = parseInt(layernr);
    if (layernr > this.network.length - 1) console.error("That layer doesn't exist");
    if (layernr < 0) layernr = this.network.length + layernr;
    if (layernr < -this.network.length);
    return this.network[layernr];
  }

  forAllLayers(f, backwards) {
    if (!backwards) {
      for (let i in this.network) {
        f(parseInt(i));
      }
    } else {
      for (let i in this.network) {
        f(parseInt(this.network.length - 1 - i));
      }
    }
  }

  forAllNeurons(f, backwards) {
    if (!backwards) {
      for (let i in this.network) {
        for (let j in this.network[i]) {
          f(parseInt(i), parseInt(j));
        }
      }
    } else {
      for (let i in this.network) {
        for (let j in this.network[this.network.length - 1 - i]) {
          f(parseInt(this.network.length - 1 - i), parseInt(j));
        }
      }
    }
  }

  forAllNeuronsInLayer(f, layernr) {
    if (layernr > this.network.length - 1) console.error("That layer doesn't exist");
    if (layernr < 0) layernr = this.network.length + layernr;
    for (let i in this.network[layernr]) {
      if (this.network[layernr]) f(layernr, i);
    }
  }

  getWeight(n, n2) {
    if (n2.layer - n.layer != 1) console.error("These neurons don't have a connection");
    return this.network[n2.layer][n2.neuron].weight[n.neuron];
  }

  setWeight(n, n2, num) {
    if (n2.layer - n.layer != 1) console.error("These neurons don't have a connection");
    this.network[n2.layer][n2.neuron].weight[n.neuron] = num;
    return this;
  }

  train(input, expectedOutput) {
    let res = this.feed(input);
    this.globalError = 0;
    let cost = 0;

    this.forAllNeuronsInLayer((layernr, neuronnr) => {
      let n = this.getNeuron(layernr, neuronnr);
      let grad = this.deriveNormalize(n.activation);
      let error = expectedOutput[neuronnr] - n.activation;
      n.error = grad * error;
      cost += Math.abs(error);
      n.bias += this.learningRate * n.error;
    }, -1);
    this.cost = cost;

    this.forAllNeurons((layernr, neuronnr) => {
      let currentNeuron = this.getNeuron(layernr, neuronnr);
      if (layernr <= this.network.length - 2) {
        let nextLayer = this.getLayer(layernr + 1);

        let sum = 0;
        for (let i in nextLayer) {
          sum += this.getWeight(currentNeuron, nextLayer[i]) * nextLayer[i].error;
        }

        currentNeuron.error = sum * this.deriveNormalize(currentNeuron.activation);
        this.globalError += Math.abs(currentNeuron.error);
        currentNeuron.bias += this.learningRate * currentNeuron.error;

        for (let index in nextLayer) {
          let w = this.getWeight(currentNeuron, nextLayer[index]) + this.learningRate * nextLayer[index].error * currentNeuron.activation;
          this.setWeight(currentNeuron, nextLayer[index], w);
        }
      }
    }, true);

    return this.cost;
  }

  autoTrain(inputArray, expectedOutputArray) {
    if (expectedOutputArray) {
      for (let i in inputArray) {
        this.train(inputArray[i], expectedOutputArray[i]);
      }
    } else {
      for (let i in inputArray) {
        this.train(inputArray[i][0], inputArray[i][1]);
      }
    }
  }

  feed(input) {
    // Error handling
    let error = false;
    if (!error && !input) {
      console.error("Please provide the input");
      error = true;
    }
    if (!error && input.length != this.network[0].length) {
      console.error(`The input array must be of the same length as the input layer, it is now ${input.length}, but it should be ${this.network[0].length}`);
      error = true;
    }
    if (!error && !Array.isArray(input)) {
      console.error("Please check if the input is an array");
      error = true;
    }
    // if (error) process.exit();

    //Set input layer
    for (let i in this.getLayer(0)) {
      let current = this.getLayer(0)[i];
      current.activation = input[i];
    }

    this.forAllNeurons((layernr, neuronnr) => {
      if (layernr != 0) {
        let current = this.getNeuron(layernr, neuronnr);

        let total = 0;
        for (let l in current.weight) {
          total += current.weight[l] * this.getLayer(layernr - 1)[l].activation;
        }
        total += parseFloat(current.bias);
        current.lastActivation = current.activation;
        current.activation = this.normalize(total);
      }
    });

    // Format output
    let res = [];
    this.forAllNeuronsInLayer((layernr, neuronnr) => {
      res.push(parseFloat(this.getLayer(-1)[neuronnr].activation));
    }, -1)
    return res;
  }

  normalize(input) {
    switch (this.activationFunction) {
      case activationFunctions.SIGMOID:
        return 1 / (1 + Math.pow(Math.E, -input));
        break;
      case activationFunctions.TANH:
        return 2 / (1 + Math.pow(Math.E, -2 * input));
        break;
      case activationFunctions.RELU:
        Math.max(input, 0);
        break;
      default:
        console.error("Invalid normalizing method");
        process.exit();
    }
  }

  deriveNormalize(input) {
    switch (this.activationFunction) {
      case activationFunctions.SIGMOID:
        return input * (1 - input);
        break;
      case activationFunctions.TANH:
        return 1 - Math.pow((2 / (1 + Math.pow(Math.E, -2 * input))), 2);
        break;
      case activationFunctions.RELU:
        return input;
        break;
      default:
        console.error("Invalid normalizing method");
        process.exit();
    }
  }

  async load(path, callback) {
    let response = await fetch(path);
    let data = await response.json();

    this.learningRate = data[0].learningRate;
    this.activationFunction = data[0].activationFunction;

    data.shift();

    this.network = [];
    for (let i in data) {
      i = parseInt(i);
      let _layer = [];
      for (let j in data[i]) {
        let _n = new neuron(i, j);
        _n.weight = data[i][j].weight;
        _n.bias = data[i][j].bias;
        _n.lastActivation = data[i][j].lastActivation;
        _layer.push(_n);
      }
      this.network.push(_layer);
    }

    if (callback) callback();
    return;
  }

  getParamCount() {
    let params = 0;
    this.forAllLayers((i) => {
      params += this.network[i].length;
      if (i != 0) params += this.network[i].length * this.network[i - 1].length;
    });
    return params;
  }
}

class population {
  constructor(structure, size, mutationRate, percentile) {
    this.population = [];
    this.generation = 0;
    this.network = 0;
    this.structure = structure;
    this.maxMutation = 1;

    let generation = [];
    for (let i = 0; i < size; i++) {
      let n = new network(structure, 0);
      generation.push({
        network: n,
        id: i,
        fitness: null
      });
    }
    this.size = size;
    this.population = generation;
    this.mutationRate = mutationRate;
    this.percentile = percentile;
  }

  getCurrentGeneration() {
    return this.population;
  }

  getCurrentNetwork() {
    return this.population[this.network].network;
  }

  cycle() {
    this.network++;
    if (this.network >= this.size) {
      this.nextGeneration();
      this.network = 0;
    }
  }

  selectBestNetwork() {
    let sorted = this.population.sort(function(a, b) {
      return b.fitness - a.fitness;
    });
    console.log(sorted[0]);
    this.network = sorted[0].id;
  }

  nextGeneration() {
    let sorted = this.population.sort(function(a, b) {
      return b.fitness - a.fitness;
    });
    let highestIndex = Math.floor(sorted.length * this.percentile);
    sorted.splice(highestIndex, sorted.length - highestIndex + 1)
    console.log(sorted[0].fitness);

    let prevGeneration = this.population;
    let generation = [];
    this.population = [];
    for (let i = 0; i < this.size; i++) {
      let j = floor(i / (this.size / sorted.length));
      // let net = sorted[j].network;

      let net = new network(this.structure, 0);
      let tempNet = [];
      let layer = [];
      sorted[j].network.forAllNeurons((layernr, neuronnr) => {
        let parentNet = sorted[j].network;
        let n = new neuron(layernr, neuronnr);
        n.lastActivation = parentNet.network[layernr][neuronnr].lastActivation;
        n.activation = parentNet.network[layernr][neuronnr].activation;

        if (Math.random() <= this.mutationRate && this.network != 0) {
          n.bias = Math.random() * this.maxMutation * 2 - this.maxMutation;
        } else {
          n.bias = parentNet.network[layernr][neuronnr].bias;
        }
        for (let k in parentNet.network[layernr][neuronnr].weight) {
          if (Math.random() <= this.mutationRate && this.network != 0) {
            n.weight.push(Math.random() * this.maxMutation * 2 - this.maxMutation);
          } else {
            n.weight.push(parentNet.network[layernr][neuronnr].weight[k]);
            // n.weight.push(i);
          }
        }
        layer.push(n);
        if (neuronnr == this.structure[layernr] - 1) {
          tempNet.push(layer);
          layer = [];
        }
      });
      net.network = [...tempNet];

      // net.forAllNeurons((layernr, neuronnr) => {
      //   let neuron = net.getNeuron(layernr, neuronnr);
      //   // neuron.bias = i;
      //   for (let k in neuron.weight) {
      //     neuron.weight[k] = i/20;
      //   }
      //   net.network[layernr][neuronnr] = neuron;
      // });
      this.population.push({
        network: net,
        id: i,
        fitness: null
      })
      // console.log(this.population);
      // console.log(this.population[i].network.network[1][0].weight[0], this.population[i].network.network[1][0]);
    }
    // this.population = generation;
    this.generation++;
  }
}
