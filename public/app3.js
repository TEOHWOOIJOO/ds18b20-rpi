document.addEventListener('DOMContentLoaded', function() {
  const db = firebase.database();

  // Create listeners
  const devicesRef = db.ref('/rasp-pi12345/temperature');

  //console output successful 
  // Register functions that update with last devices state
  devicesRef.on('value', function (snapshot) {
    let devices = snapshot.val();
    let array = [];
    console.log(devices);
    console.debug(typeof devices);
    // console.log(snapshot);
    Object.keys(devices).forEach((k,v) => {
      // console.log("--");
      // console.log(k);
      // console.log(devices[k].Celcius);
      array[k] = devices[k].Celcius;
    });
    console.log('new arr');
    console.debug(array);
    let devicesEl = document.getElementById('devices');
    devicesEl.innerHTML = '';



    //try disable this for console output
        for (var key in devices) {
          let deviceState = devices[key];
          let li = document.createElement('li');
          li.className = 'mdc-list-item';
          li.innerHTML = `
            <span class="mdc-list-item__start-detail grey-bg" role="presentation">
                <i class="material-icons" aria-hidden="true">cloud</i>
            </span>
            <span class="mdc-list-item__text">
                Station #${key}
                <span class="mdc-list-item__text__secondary">
                    ${deviceState.temp} C°/${deviceState.temp} %
                </span>
                <span class="mdc-list-item__text__secondary">
                    Last updated: ${new Date(
                      deviceState.lastTimestamp
                    ).toLocaleString()}
                </span>
            </span>
          `;

          devicesEl.appendChild(li);
        }
      });

     fetchReportData();
    });

    const reportDataUrl = "https://rasp-pi12345.firebaseio.com/data.json";

    function fetchReportData() {
      try {
        fetch(reportDataUrl)
          .then(res => res.json())
          .then(rows => {
            const minTempData = rows.map(row => row.min_temp);
            const maxTempData = rows.map(row => row.max_temp);
            const avgTempData = rows.map(row => row.avg_temp);


            const labels = rows.map(row => row.data_hora.value);

            buildLineChart(
              'tempLineChart',
              'Temperature in C°',
              labels,
              '#e64d3d',
              avgTempData
            );
          });
      } catch (e) {
        alert('Error getting report data');
      }
    }

    // Constroi um gráfico de linha no elemento (el) com a descrição (label) e os
    // dados passados (data)
    function buildLineChart(el, label, labels, color, avgData) {
      const elNode = document.getElementById(el);
      new Chart(elNode, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: label,
              data: avgData,
              borderWidth: 1,
              fill: true,
              spanGaps: true,
              lineTension: 0.2,
              backgroundColor: color,
              borderColor: '#3A4250',
              pointRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            xAxes: [
              {
                type: 'time',
                distribution: 'series',
                ticks: {
                  source: 'labels'
                }
              }
            ],
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: label
                },
                ticks: {
                  stepSize: 0.5
                }
              }
            ]
          }
        }
      });

      const progressEl = document.getElementById(el + '_progress');
      progressEl.remove();
    }


 //});

//});