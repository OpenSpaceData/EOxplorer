function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

// places to select

var places = {
  'London, Great Britain': [-0.126665, 51.507033, 11],
  'Rio Xingu River, Brazil': [-52.980358, -10.271681, 11],
  'Anholt Island, Denmark': [11.578340, 56.714116, 10]
};

// Explaination content

var indices = {
  'What does true color mean?': indiceTCI,
  'What does NDVI mean?': indiceNDVI,
};

var indiceTCI = ui.Label({
  value: 'True color composite uses visible light bands red (B04), green (B03) and blue (B02) in the corresponding red, green and blue color channels, resulting in a natural colored result, that is a good representation of the Earth as humans would see it naturally.',
  style: {fontSize: '12px', margin: '0px 10px 0px 10px'}
});

var indiceNDVI = ui.Label({
  value: 'True color composite uses visible light bands red (B04), green (B03) and blue (B02) in the corresponding red, green and blue color channels, resulting in a natural colored result, that is a good representation of the Earth as humans would see it naturally.',
  style: {fontSize: '12px', margin: '0px 10px 0px 10px'}
});

// Map the function over one year of data and take the median.
// Load Sentinel-2 TOA reflectance data.
var dataset = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2018-01-01', '2018-06-30')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .sort('CLOUDY_PIXEL_PERCENTAGE')
                  .map(maskS2clouds);

var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

var image = dataset.mosaic()
var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
var ndviParams = {
  min: -1, 
  max: 1, 
  palette: ['blue', 'white', 'green'],
};

var falseColor = {
  min: 0.0,
  max: 0.3,
  bands: ['B12', 'B11', 'B4'],
};

var vegetationHealth = {
  min: 0.0,
  max: 0.3,
  bands: ['B8', 'B11', 'B2'],
};

// Explaination view

function explainationView() {
  
  var ndviTitel = ui.Label({
    value: 'What says the NDVI?',
    style: {fontSize: '14px', fontWeight: 'bold', margin: '20px 20px 0px 10px'}
  });
  
  var ndviText = ui.Label({
    value: 'To explore the world through the eyes of the ESA Sentinel-2 satellite, you can simply drag any map section, search for a location in the search at the top, or select one of our sample locations through the dropdown. Have fun exploring!',
    style: {fontSize: '14px', margin: '10px 20px 0px 10px'}
  });

}

// Create a map for each visualization option.
var map1 = ui.Map()
map1.add(ui.Label('True Color', {position: 'top-right'}))
map1.addLayer(dataset.median(), rgbVis, 'RGB')
map1.setControlVisibility(false);
map1.onClick(explainationView);

var map2 = ui.Map()
map2.add(ui.Label('False Color (Urban)', {position: 'top-right'}))
map2.addLayer(dataset, falseColor, 'False Color (Urban)')
map2.setControlVisibility(false);

var map3 = ui.Map()
map3.add(ui.Label('Healthy Vegetation', {position: 'top-right'}))
map3.addLayer(dataset, vegetationHealth, 'Healthy Vegetation')
map3.setControlVisibility(false);

var map4 = ui.Map()
map4.add(ui.Label('NDVI', {position: 'top-right'}))
map4.addLayer(ndvi, ndviParams, 'NDVI')
map4.setControlVisibility(false);

var linker = ui.Map.Linker([map1, map2, map3, map4]);

// Enable zooming on the top-left map.
map1.setControlVisibility({zoomControl: true});

// Show the scale (e.g. '500m') on the bottom-right map.
map3.setControlVisibility({scaleControl: true});

// Create a grid of maps.
var mapGrid = ui.Panel(
    [
      ui.Panel([map1, map2], null, {stretch: 'both'}),
      ui.Panel([map3, map4], null, {stretch: 'both'})
    ],
    ui.Panel.Layout.Flow('horizontal'), {stretch: 'both'});

// Panel

var titel = ui.Label({
  value: 'EOxplorer',
  style: {fontSize: '40px'}
});

var appDesc = ui.Label({
  value: 'This app provides an easy way to understand how Earth observation data works and what information it could provide.',
  style: {fontSize: '16px', fontWeight: 'bold', margin: '0px 20px 10px 10px'}
});

var instructionsTitel = ui.Label({
  value: 'How to use this app?',
  style: {fontSize: '14px', fontWeight: 'bold', margin: '20px 20px 0px 10px'}
});

var indiceTitel = ui.Label({
  value: 'Which information does the maps show?',
  style: {fontSize: '14px', fontWeight: 'bold', margin: '20px 20px 0px 10px'}
});

var instructions = ui.Label({
  value: 'To explore the world through the eyes of the ESA Sentinel-2 satellite, you can simply drag any map section, search for a location in the search at the top, or select one of our sample locations through the dropdown. Have fun exploring!',
  style: {fontSize: '14px', margin: '10px 20px 0px 10px'}
});

var creator = ui.Label({
  value: 'This app was created by Niklas Jordan as an OpenSpaceData.org project. We want to democratizing satellite data – through easy to use tools and education.',
  style: {fontSize: '12px', margin: '20px 20px 10px 10px'}
});

var placesTitel = ui.Label({
  value: 'Example locations:',
  style: {fontSize: '14px', fontWeight: 'bold', margin: '20px 20px 0px 10px'}
});

var helpTitel = ui.Label({
  value: 'GET HELP',
  style: {fontSize: '16px', fontWeight: 'bold', margin: '20px 20px 0px 10px'}
});

var placesUi = ui.Select({
  items: Object.keys(places),
  onChange: function(key) {
    map1.setCenter(places[key][0], places[key][1], places[key][2]);
  },
  style: {width: '300px', margin: '10px 20px 20px 10px'}
});

placesUi.setPlaceholder('Choose a location...');

var indiceSelect = ui.Select({
  items: Object.keys(indices),
  onChange: function(key) {
    panel.insert(9, indices[key])
  },
  style: {width: '300px', margin: '10px 20px 20px 10px', textAlign: 'left'}
});

var panel = ui.Panel(
    [
      ui.Panel(titel, null, {stretch: 'both'}),
      ui.Panel(appDesc, null, {stretch: 'both'}),
      ui.Panel(placesTitel, null, {stretch: 'both'}),
      ui.Panel(placesUi, null, {stretch: 'both'}),
      ui.Panel(helpTitel, null, {stretch: 'both'}),
      ui.Panel(instructionsTitel, null, {stretch: 'both'}),
      ui.Panel(instructions, null, {stretch: 'both'}),
      ui.Panel(indiceTitel, null, {stretch: 'both'}),
      ui.Panel(indiceSelect, null, {stretch: 'both'}),
      ui.Panel(creator, null, {stretch: 'both'}),
    ],
    ui.Panel.Layout.Flow('vertical'), {width: '400px'});

// Center the map at an interesting spot in Greece. All
// other maps will align themselves to this parent map.
map1.setCenter(-9.1695, 38.6917, 12);

// Add the maps and title to the ui.root.
ui.root.widgets().reset([panel, mapGrid]);
ui.root.setLayout(ui.Panel.Layout.Flow('horizontal'));
