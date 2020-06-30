// count convert toy, initially this will show a calculator which will
// manually factor in QE, counts, offset, and conversion gain to convert counts to
// photons or vice versa

// so what should be there as a first draft
// maybe just interconnected boxes
// Counts = photons * QEsensor(lambda) * Conversion Gain + ADC Offset

console.log('Count Convert Toy, Adam Wise 2020');

// rounding function with specific number of decimal places d
function r(n,d){
    return Math.round(n*10**d)/10**d;
}

// app state
var app = {};

// validation ranges for inputs
var validRange = { 
    'photons' : { 'min': 0, 'max' : 10**9},
    'counts' : { 'min': 0, 'max' : 10**9},
    'gain' : { 'min': 0, 'max' : 10**9},
    'qe' : { 'min': 0, 'max' : 1},
    'offset' : { 'min': 0, 'max' : 10**9},
    
}


function updateVals(param){

    if (param == 'photons'){
        var newCounts = (app['photons'] * app['qe']) * app['gain'] + app['offset'];
        console.log(newPhotons, ' counts would be measured')
    
        if (!isNaN(newCounts)){

            if (newCounts < 0){
                d3.select('#messages').text('Photons too low given this gain, QE, and offset')
                return
            }

            d3.select('#countInput').property('value', r(newCounts,2))
            app['counts'] = newCounts;
        }
        return
    }

    //d3.select('#')
    var newPhotons = (app['counts'] - app['offset']) / app['gain'] / app['qe'];
    console.log(newPhotons, ' photons were detected')

    if (!isNaN(newPhotons)){

        if (newPhotons < 0){
            d3.select('#messages').text('Error - counts are less than offset').style('color','red')
            return
        }

        app['photons'] = newPhotons;
        d3.select('#photonInput').property('value', r(newPhotons,2))
        d3.select('#messages').text('Enter Values to Update').style('color', 'black')
    }
}

d3.selectAll('.eqInput').on('input', function(){
    var newVal = Number(d3.select(this).property('value'));
    var param = d3.select(this).attr('param');
    console.log(param, newVal)

    // validate input value
    var paramMin = validRange[param]['min'];
    var paramMax = validRange[param]['max'];
    
    if (newVal > paramMax){
        newVal = paramMax;
        d3.select(this).property('value', paramMax)
    }

    if (newVal < paramMin){
        newVal = paramMin;
        d3.select(this).property('value', Number(paramMin))
    }

    app[param] = newVal;
    updateVals(param);
})