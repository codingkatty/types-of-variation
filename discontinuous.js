import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { supabaseUrl, supabaseKey } from "./config.js";

const supabase = createClient(supabaseUrl, supabaseKey);

const chartContext = document.getElementById("chart").getContext("2d");
let chart;
let isSubmitted = false;

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

window.addEventListener("load", () => {
  isSubmitted = !!getCookie("hasSubmittedDiscontinuous");
  if (isSubmitted) {
    disableForm();
  }
  updateChart();
});

function disableForm() {
  document.getElementById("age").disabled = true;
  document
    .querySelectorAll('input[name="bloodType"]')
    .forEach((radio) => (radio.disabled = true));
  const submitBtn = document.getElementById("submitButton");
  submitBtn.disabled = true;
  submitBtn.textContent = "Already Submitted";
}

document.getElementById("submitButton").addEventListener("click", async () => {
  if (isSubmitted) {
    alert("You have already submitted data. Thank you for participating!");
    return;
  }

  const age = parseInt(document.getElementById("age").value);
  const bloodTypeEl = document.querySelector(
    'input[name="bloodType"]:checked'
  );

  if (!bloodTypeEl || isNaN(age)) {
    alert("Please enter valid age and select blood type.");
    return;
  }

  try {
    const { error } = await supabase
      .from("blood_submissions")
      .insert([{ age, blood_type: bloodTypeEl.value }]);

    if (error) throw error;

    setCookie("hasSubmittedDiscontinuous", "true", 30);
    isSubmitted = true;
    alert("Data submitted successfully!");
    disableForm();
    await updateChart();
  } catch (err) {
    console.error("Submission error:", err);
    alert("Failed to submit data. Please try again.");
  }
});

async function updateChart() {
  try {
    const chartContext = document.getElementById("chart");
    if (!chartContext) {
      console.error("Chart canvas not found");
      return;
    }

    const { data: submissions, error } = await supabase
      .from("blood_submissions")
      .select("*");

    if (error) throw error;

    const bloodTypes = {
      'A': { count: 0, ages: [] },
      'B': { count: 0, ages: [] },
      'AB': { count: 0, ages: [] },
      'O': { count: 0, ages: [] }
    };

    submissions?.forEach(({ blood_type, age }) => {
      if (blood_type in bloodTypes) {
        bloodTypes[blood_type].count++;
        bloodTypes[blood_type].ages.push(age);
      }
    });

    const data = {
      labels: Object.keys(bloodTypes),
      datasets: [
        {
          label: "Blood Type Distribution",
          data: Object.values(bloodTypes).map(type => type.count),
          backgroundColor: "rgba(197, 40, 61, 0.7)",
          borderColor: "#481d24",
          borderWidth: 2,
          borderRadius: 4
        },
      ],
    };

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(chartContext, {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                const label = Object.keys(bloodTypes)[index];
                const ages = bloodTypes[label].ages;
                
                const avgAge = ages.length ? 
                    Math.round(ages.reduce((a,b) => a+b) / ages.length) : 0;
                const minAge = Math.min(...ages);
                const maxAge = Math.max(...ages);
                
                return [
                    `Blood Type: ${label}`,
                    `Age Range: ${minAge}-${maxAge}`,
                    `Average Age: ${avgAge}`
                ];
              },
              label: (tooltipItem) => `Count: ${Math.round(tooltipItem.raw)}`
            }
          }
        }
      },
    });
  } catch (err) {
    console.error("Chart error:", err);
  }
}
