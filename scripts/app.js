// Registering a ServiceWorker.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', {scope: './'})
    .then(function(registration) {
        console.log('Service Worker Registered', registration);
    }).catch(function(error){
        console.log('Service Worker Failed to Register', error);
    })
}

// Checking for IndexedDB support
if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
}

function getCurrencyUsingJQuery() {
  var currVal = $("#CURR_VAL");
  currVal.val("");

  var currFrSelect = $("#CURR_ZAR");
  var zar = currZarSelect.val();

  var currToSelect = $("#CURR_TO");
  var to = currToSelect.val();


  var currId = zar + "_" + to;
  var protocol = window.location.protocol.replace(/:/g,'');

  currVal.attr("placeholder", "Converting...");
  $.getJSON(protocol + "://free.currencyconverterapi.com/api/v5/convert?q=" + currId + "&compact=y&callback=?",
    function(data){
      try {
       var currZarVal = parseFloat(document.getElementById("CURR_ZAR_VAL").value);
       currVal.val(numeral(currZarVal * data[currId].val).format("0,0.00[0]"));

     } catch (e) {
      alert("Please enter a number in the Amount field.");
    }

    currVal.attr("placeholder", "Press Convert button");

  });

}
