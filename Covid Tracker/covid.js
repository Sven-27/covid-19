window.onload = () => {
  getCountryData();
  getHistoricalData();
  // buildPieChart(allchartData);
};

var map;
var infoWindow;
function initMap() {
  //var center = { lat: 52.5001698, lng: 5.7480821 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 52.5001698, lng: 5.7480821 },
    zoom: 3,
    styles: mapStyle,
  });
  infoWindow = new google.maps.InfoWindow();
}

const getCountryData = () => {
  fetch("http://localhost:3000/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      showDataOnMap(data);
      showDataInTable(data);
    });
};

const getHistoricalData = () => {
  fetch("https://corona.lmao.ninja/v2/historical/all?lastdays=120")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let allChartData = buildChartData(data);
      buildChart(allChartData);
      buildPieChart(allChartData);
    });
};

const buildChartData = (data) => {
  let totalCasesData = [];
  let recoveredData = [];
  let deathsData = [];

  for (let date in data.cases) {
    let newDataPoint = {
      x: date,
      y: data.cases[date],
    };
    totalCasesData.push(newDataPoint);
  }

  for (let date in data.recovered) {
    let newDataPoint = {
      x: date,
      y: data.recovered[date],
    };
    recoveredData.push(newDataPoint);
  }

  for (let date in data.deaths) {
    let newDataPoint = {
      x: date,
      y: data.deaths[date],
    };
    deathsData.push(newDataPoint);
  }

  let allChartData = { totalCasesData, recoveredData, deathsData };
  return allChartData;
};

const showDataOnMap = (data) => {
  data.map((country) => {
    let countryCenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    var countryCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: map,
      center: countryCenter,
      radius: country.casesPerOneMillion * 15,
    });

    var html = `
    <div class="info-container">
    <div class="info-flag" style="background-image: url(${country.countryInfo.flag})">
    </div>
    <div class="info-name">
    ${country.country}
    </div>
    <div class="info-confirmed">
    Total: ${country.cases}
    </div>
    <div class="info-recovered">
    Recovered: ${country.recovered}
    </div>
    <div class="info-deaths">
    Deaths: ${country.deaths}
    </div>
    </div>
    `;

    var infoWindow = new google.maps.InfoWindow({
      content: html,
      position: countryCircle.center,
    });
    google.maps.event.addListener(countryCircle, "mouseover", function () {
      infoWindow.open(map);
    });
    google.maps.event.addListener(countryCircle, "mouseout", function () {
      infoWindow.close();
    });
  });
};

const showDataInTable = (data) => {
  var html = "";
  data.forEach((country) => {
    html += `
      <tr>
          <td>${country.country}</td>
          <td>${numeral(country.cases).format(0, 0)}</td>
          <td>${numeral(country.recovered).format(0, 0)}</td>
          <td>${numeral(country.deaths).format(0, 0)}</td>
      </tr>
    `;
  });
  document.getElementById("table-data").innerHTML = html;
};

const buildChart = (allChartData) => {
  var timeFormat = "MM/DD/YY";
  var ctx = document.getElementById("myChart").getContext("2d");
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      datasets: [
        {
          label: "Total cases",
          borderColor: "#1ac6ff",
          data: allChartData.totalCasesData,
          fill: false,
          pointRadius: 0.5,
        },
        {
          label: "Recovered",
          borderColor: "#00ff00",
          data: allChartData.recoveredData,
          fill: false,
          pointRadius: 0.5,
        },
        {
          label: "Deaths",
          borderColor: "#ff0000",
          data: allChartData.deathsData,
          fill: false,
          pointRadius: 0.5,
        },
      ],
    },

    // Configuration options go here
    options: {
      maintainAspectRatio: false,
      tooltips: {
        mode: "index",
        intersect: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              format: timeFormat,
              tooltipFormat: "ll",
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return numeral(value).format("0,0");
              },
            },
          },
        ],
      },
    },
  });
};

const buildPieChart = (allChartData) => {
  new Chart(document.getElementById("pie-chart").getContext("2d"), {
    type: "pie",
    data: {
      labels: ["Total Cases", "Recovered", "Deaths"],
      datasets: [
        {
          label: "Data",
          backgroundColor: ["#1ac6ff", "#00ff00", "#ff0000"],
          data: [],
        },
      ],
    },
    options: {
      title: {
        display: true,
      },
    },
  });
};
