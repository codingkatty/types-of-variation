import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { SUPABASE_KEY } from "./config.js"

const supabaseUrl = "https://msfutgjgflgkckxreksp.supabase.co";
const supabaseKey = SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const chartContext = document.getElementById("chart").getContext("2d");
let chart;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

document.getElementById("submitButton").addEventListener("click", async () => {
  if (getCookie("hasSubmitted")) {
    alert("You have already submitted data. Thank you for participating!");
    return;
  }

  const age = parseInt(document.getElementById("age").value);
  const height = parseInt(document.getElementById("height").value);

  if (isNaN(age) || isNaN(height)) {
    alert("Please enter valid age and height.");
    return;
  }

  try {
    const { error } = await supabase
      .from("submissions")
      .insert([{ age, height }]);
    if (error) {
      console.error("Error inserting data:", error.message);
      alert("Failed to submit data. Please try again.");
    } else {
      setCookie("hasSubmitted", "true", 30);
      alert("Data submitted successfully!");
      await updateChart();

      document.getElementById("age").disabled = true;
      document.getElementById("height").disabled = true;
      document.getElementById("submitButton").disabled = true;
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred.");
  }
});

window.addEventListener("load", () => {
  if (getCookie("hasSubmitted")) {
    document.getElementById("age").disabled = true;
    document.getElementById("height").disabled = true;
    document.getElementById("submitButton").disabled = true;
    document.getElementById("submitButton").textContent = "Already Submitted";
  }
});

async function updateChart() {
  try {
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("*");
    if (error) {
      console.error("Error fetching data:", error.message);
      return;
    }

    const heightRangesWithAges = {
      "<124": { count: 0, ages: [] },
      "125-129": { count: 0, ages: [] },
      "130-134": { count: 0, ages: [] },
      "135-139": { count: 0, ages: [] },
      "140-144": { count: 0, ages: [] },
      "145-149": { count: 0, ages: [] },
      "150-154": { count: 0, ages: [] },
      "155-159": { count: 0, ages: [] },
      "160-164": { count: 0, ages: [] },
      "165-169": { count: 0, ages: [] },
      "170-174": { count: 0, ages: [] },
      "175-179": { count: 0, ages: [] },
      ">180": { count: 0, ages: [] },
    };

    submissions.forEach(({ height, age }) => {
      if (height < 124) {
        heightRangesWithAges["<124"].count++;
        heightRangesWithAges["<124"].ages.push(age);
      } else if (height <= 129) {
        heightRangesWithAges["125-129"].count++;
        heightRangesWithAges["125-129"].ages.push(age);
      } else if (height <= 134) {
        heightRangesWithAges["130-134"].count++;
        heightRangesWithAges["130-134"].ages.push(age);
      } else if (height <= 139) {
        heightRangesWithAges["135-139"].count++;
        heightRangesWithAges["135-139"].ages.push(age);
      } else if (height <= 144) {
        heightRangesWithAges["140-144"].count++;
        heightRangesWithAges["140-144"].ages.push(age);
      } else if (height <= 149) {
        heightRangesWithAges["145-149"].count++;
        heightRangesWithAges["145-149"].ages.push(age);
      } else if (height <= 154) {
        heightRangesWithAges["150-154"].count++;
        heightRangesWithAges["150-154"].ages.push(age);
      } else if (height <= 159) {
        heightRangesWithAges["155-159"].count++;
        heightRangesWithAges["155-159"].ages.push(age);
      } else if (height <= 164) {
        heightRangesWithAges["160-164"].count++;
        heightRangesWithAges["160-164"].ages.push(age);
      } else if (height <= 169) {
        heightRangesWithAges["165-169"].count++;
        heightRangesWithAges["165-169"].ages.push(age);
      } else if (height <= 174) {
        heightRangesWithAges["170-174"].count++;
        heightRangesWithAges["170-174"].ages.push(age);
      } else if (height <= 179) {
        heightRangesWithAges["175-179"].count++;
        heightRangesWithAges["175-179"].ages.push(age);
      } else {
        heightRangesWithAges[">180"].count++;
        heightRangesWithAges[">180"].ages.push(age);
      }
    });

    const labels = Object.keys(heightRangesWithAges);
    const data = labels.map((label) => heightRangesWithAges[label].count);

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update();
    } else {
      chart = new Chart(chartContext, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Number of Individuals",
              data,
              backgroundColor: "rgba(233, 114, 76, 0.7)",
              borderColor: "#c5283d",
              borderWidth: 2,
              borderRadius: 4,
            },
          ],
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex;
                  const label = labels[index];
                  const ages = heightRangesWithAges[label].ages;

                  const avgAge = ages.length
                    ? Math.round(ages.reduce((a, b) => a + b) / ages.length)
                    : 0;
                  const minAge = Math.min(...ages);
                  const maxAge = Math.max(...ages);

                  return [
                    `Height Range: ${label}`,
                    `Age Range: ${minAge}-${maxAge}`,
                    `Average Age: ${avgAge}`,
                  ];
                },
                label: (tooltipItem) => {
                  return `Count: ${Math.round(tooltipItem.raw)}`;
                },
              },
            },
            legend: {
              labels: {
                font: {
                  family: "'Segoe UI', system-ui, sans-serif",
                },
              },
            },
          },
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
              },
              title: {
                display: true,
                text: "Number of Individuals",
                font: {
                  family: "'Segoe UI', system-ui, sans-serif",
                  weight: 500,
                },
              },
            },
            x: {
              title: {
                display: true,
                text: "Height Ranges (cm)",
                font: {
                  family: "'Segoe UI', system-ui, sans-serif",
                  weight: 500,
                },
              },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error("Unexpected error while updating chart:", err);
  }
}

updateChart();
