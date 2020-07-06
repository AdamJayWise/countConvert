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
    'emGain' : { 'min': 1, 'max' : 1000},
    
}


// a function to append an inline div that pops up a new closeable div with a tooltip inside
function addToolTip(targetSelection, message){
    var tipButton = targetSelection.append('div');
    tipButton.classed('tipButton', true);    
    tipButton.text('?');

    tipButton.on('click', function(){

        var screenDiv = d3.select('body').append('div')
        screenDiv.classed('screen', true);
        screenDiv.on('click', function(){
            screenDiv.remove();
            messageDiv.remove();
        })
        
        var messageDiv = d3.select('body').append('div').classed('messageDiv', true);
        messageDiv.style('left', Math.max(10, d3.event.x - messageDiv.style('width').split('px')[0] )+ 'px');
        messageDiv.style('top', d3.event.y + 'px')
        messageDiv.text(message);
        messageDiv.on('click', function(){
            screenDiv.remove();
            messageDiv.remove();
        })
        
    })

    return tipButton;

}

var tipDict = {
    'gain':"Analog to Digital Converter (ADC) gain is the exchange rate between electrons in a pixel and the digital number representation of that pixel.  Here it's shown in counts per electron, or how many electrons must be in a pixel to register a single 'count' in the raw data set.",
    'offset' : "An offset is applied to the signal during digitization to simplify digital bookkeeping.  It isn't created by light and needs to be removed to get an accurate count of photons, but luckily it will the same for each pixel in a single image.  Generally this offset is a few hundred counts, but varies camera-to-camera and on the specific acquisition mode used.",
    'qe' : "Quantum Efficiency (QE) is the ratio of photons incident on a pixel to electrons collected from that pixel, before any EM gain is applied.  Here it is specified from 0 to 1, although percentages are common as well.  QE depends strongly on wavelength and sensor type.",
}

d3.selectAll('.eqInput').each(function(p,j){
    var thisParam = this.id.split('Input')[0];
    addToolTip(d3.select(this.parentNode.parentNode).select('.inputLabel'), tipDict[thisParam])
})


function updateVals(param){

    if (param == 'photons'){
        var newCounts = (app['photons'] * app['qe'] * app['emGain']) * app['gain'] + app['offset'];
        console.log(newPhotons, ' counts would be measured')
    
        if (!isNaN(newCounts)){

            if (newCounts < 0){
                d3.select('#messages').text('Photons too low given this gain, QE, and offset')
                return
            }

            d3.select('#countInput').property('value', r(newCounts,2))
            d3.select('#messages').text('Enter Values to Update').style('color', 'black')
            app['counts'] = newCounts;
        }
        return
    }

    //d3.select('#')
    var newPhotons = (app['counts'] - app['offset']) / app['gain'] / app['qe'] / app['emGain'];
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