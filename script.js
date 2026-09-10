// ========================================
// FLOWGUARD - COMPLETE JAVASCRIPT
// ========================================


// ========================================
// 1. DOM ELEMENTS
// ========================================

const statusElement = document.getElementById("status");
const latencyElement = document.getElementById("latency");
const qualityElement = document.getElementById("quality");

const testButton = document.getElementById("testButton");

const historyTableBody =
    document.getElementById("historyTableBody");

const emptyHistory =
    document.getElementById("emptyHistory");

const clearHistoryButton =
    document.getElementById("clearHistoryButton");

const exportButton =
    document.getElementById("exportButton");

const averageLatencyElement =
    document.getElementById("averageLatency");

const bestLatencyElement =
    document.getElementById("bestLatency");

const worstLatencyElement =
    document.getElementById("worstLatency");

const testCountElement =
    document.getElementById("testCount");

const lastTestElement =
    document.getElementById("lastTest");

const healthIndicator =
    document.getElementById("healthIndicator");

const alertBox =
    document.getElementById("alertBox");

const connectionTypeElement =
    document.getElementById("connectionType");

const downlinkElement =
    document.getElementById("downlink");

const networkRttElement =
    document.getElementById("networkRtt");

const onlineStatusElement =
    document.getElementById("onlineStatus");

const monitorStatus =
    document.getElementById("monitorStatus");

const monitorInterval =
    document.getElementById("monitorInterval");

const startMonitorButton =
    document.getElementById("startMonitorButton");

const stopMonitorButton =
    document.getElementById("stopMonitorButton");

const latencyThresholdInput =
    document.getElementById("latencyThreshold");

const maxHistoryInput =
    document.getElementById("maxHistory");

const chartCanvas =
    document.getElementById("latencyChart");


// ========================================
// 2. NETWORK CONNECTION INFORMATION
// ========================================

const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;


// ========================================
// 3. APPLICATION STATE
// ========================================

let monitoringIntervalId = null;

let isTesting = false;


// ========================================
// 4. LOAD SAVED HISTORY
// ========================================

let testHistory = [];

const savedHistory =
    localStorage.getItem("flowguardHistory");


if (savedHistory) {

    try {

        testHistory =
            JSON.parse(savedHistory);


        if (!Array.isArray(testHistory)) {

            testHistory = [];

        }

    }

    catch (error) {

        console.error(
            "Could not load saved history:",
            error
        );

        testHistory = [];

    }

}


// ========================================
// 5. NETWORK QUALITY
// ========================================

function getNetworkQuality(latency) {

    if (latency < 50) {

        return "Excellent";

    }

    else if (latency < 100) {

        return "Good";

    }

    else if (latency < 150) {

        return "Fair";

    }

    else {

        return "Poor";

    }

}


// ========================================
// 6. SAVE HISTORY
// ========================================

function saveHistory() {

    localStorage.setItem(
        "flowguardHistory",
        JSON.stringify(testHistory)
    );

}


// ========================================
// 7. LIMIT HISTORY
// ========================================

function limitHistory() {

    const maximum =
        Number(maxHistoryInput.value);


    if (
        isNaN(maximum) ||
        maximum < 1
    ) {

        return;

    }


    while (
        testHistory.length > maximum
    ) {

        testHistory.shift();

    }

}


// ========================================
// 8. DISPLAY HISTORY
// ========================================

function displayHistory() {

    historyTableBody.innerHTML = "";


    if (testHistory.length === 0) {

        emptyHistory.style.display = "block";

        return;

    }


    emptyHistory.style.display = "none";


    // Newest test first

    const reversedHistory =
        [...testHistory].reverse();


    reversedHistory.forEach(
        function (test) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${test.time}</td>

                <td>${test.latency} ms</td>

                <td>${test.quality}</td>

            `;


            historyTableBody.appendChild(row);

        }
    );

}


// ========================================
// 9. CALCULATE AVERAGE LATENCY
// ========================================

function calculateAverageLatency() {

    if (testHistory.length === 0) {

        return 0;

    }


    let total = 0;


    testHistory.forEach(
        function (test) {

            total =
                total + test.latency;

        }
    );


    return Math.round(
        total / testHistory.length
    );

}


// ========================================
// 10. CALCULATE BEST AND WORST
// ========================================

function calculateBestAndWorstLatency() {

    if (testHistory.length === 0) {

        return {

            best: 0,

            worst: 0

        };

    }


    let best =
        testHistory[0].latency;


    let worst =
        testHistory[0].latency;


    testHistory.forEach(
        function (test) {

            if (test.latency < best) {

                best = test.latency;

            }


            if (test.latency > worst) {

                worst = test.latency;

            }

        }
    );


    return {

        best: best,

        worst: worst

    };

}


// ========================================
// 11. UPDATE STATISTICS
// ========================================

function updateStatistics() {

    if (testHistory.length === 0) {

        averageLatencyElement.textContent =
            "-- ms";

        bestLatencyElement.textContent =
            "-- ms";

        worstLatencyElement.textContent =
            "-- ms";

        testCountElement.textContent =
            "0";

        lastTestElement.textContent =
            "Never";

        return;

    }


    const average =
        calculateAverageLatency();


    const stats =
        calculateBestAndWorstLatency();


    averageLatencyElement.textContent =
        average + " ms";


    bestLatencyElement.textContent =
        stats.best + " ms";


    worstLatencyElement.textContent =
        stats.worst + " ms";


    testCountElement.textContent =
        testHistory.length;


    lastTestElement.textContent =
        testHistory[
            testHistory.length - 1
        ].time;

}


// ========================================
// 12. NETWORK INFORMATION
// ========================================

function displayNetworkInformation() {

    if (connection) {

        connectionTypeElement.textContent =
            connection.effectiveType ||
            "Not available";


        if (connection.downlink) {

            downlinkElement.textContent =
                connection.downlink + " Mbps";

        }

        else {

            downlinkElement.textContent =
                "Not available";

        }


        if (connection.rtt) {

            networkRttElement.textContent =
                connection.rtt + " ms";

        }

        else {

            networkRttElement.textContent =
                "Not available";

        }

    }

    else {

        connectionTypeElement.textContent =
            "Not available";

        downlinkElement.textContent =
            "Not available";

        networkRttElement.textContent =
            "Not available";

    }


    if (navigator.onLine) {

        onlineStatusElement.textContent =
            "Online 🟢";

    }

    else {

        onlineStatusElement.textContent =
            "Offline 🔴";

    }

}


// ========================================
// 13. UPDATE HEALTH
// ========================================

function updateHealth(latency) {

    const threshold =
        Number(
            latencyThresholdInput.value
        );


    // Critical

    if (latency >= threshold * 2) {

        healthIndicator.textContent =
            "● Critical";


        healthIndicator.style.background =
            "#fee2e2";


        healthIndicator.style.color =
            "#991b1b";


        alertBox.textContent =
            "Critical network latency detected.";


        alertBox.className =
            "alert-box danger";


        return;

    }


    // Warning

    if (latency >= threshold) {

        healthIndicator.textContent =
            "● Warning";


        healthIndicator.style.background =
            "#fef3c7";


        healthIndicator.style.color =
            "#92400e";


        alertBox.textContent =
            "High network latency detected.";


        alertBox.className =
            "alert-box warning";


        return;

    }


    // Healthy

    healthIndicator.textContent =
        "● Healthy";


    healthIndicator.style.background =
        "#dcfce7";


    healthIndicator.style.color =
        "#166534";


    alertBox.textContent =
        "No network problems detected.";


    alertBox.className =
        "alert-box";

}


// ========================================
// 14. DRAW LATENCY CHART
// ========================================

function drawLatencyChart() {

    const canvas =
        chartCanvas;


    const context =
        canvas.getContext("2d");


    const width =
        canvas.clientWidth;


    const height =
        canvas.clientHeight;


    if (
        width === 0 ||
        height === 0
    ) {

        return;

    }


    const devicePixelRatio =
        window.devicePixelRatio || 1;


    canvas.width =
        width * devicePixelRatio;


    canvas.height =
        height * devicePixelRatio;


    context.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );


    context.clearRect(
        0,
        0,
        width,
        height
    );


    // No data

    if (testHistory.length === 0) {

        context.fillStyle =
            "#9ca3af";


        context.font =
            "16px Arial";


        context.textAlign =
            "center";


        context.fillText(
            "No latency data yet",
            width / 2,
            height / 2
        );


        return;

    }


    // Last 20 tests

    const data =
        testHistory.slice(-20);


    const values =
        data.map(
            function (test) {

                return test.latency;

            }
        );


    const maximum =
        Math.max(...values);


    const minimum =
        Math.min(...values);


    const padding = 45;


    const chartWidth =
        width - padding * 2;


    const chartHeight =
        height - padding * 2;


    const range =
        maximum === minimum
            ? 1
            : maximum - minimum;


    // Grid

    context.strokeStyle =
        "#e5e7eb";


    context.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (chartHeight * i / 4);


        context.beginPath();


        context.moveTo(
            padding,
            y
        );


        context.lineTo(
            width - padding,
            y
        );


        context.stroke();

    }


    // Latency line

    context.beginPath();


    data.forEach(
        function (test, index) {

            const x =
                padding +
                (
                    index /
                    Math.max(
                        data.length - 1,
                        1
                    )
                ) *
                chartWidth;


            const y =
                height -
                padding -
                (
                    (
                        test.latency -
                        minimum
                    ) /
                    range
                ) *
                chartHeight;


            if (index === 0) {

                context.moveTo(
                    x,
                    y
                );

            }

            else {

                context.lineTo(
                    x,
                    y
                );

            }

        }
    );


    context.strokeStyle =
        "#2563eb";


    context.lineWidth = 3;


    context.stroke();


    // Points

    data.forEach(
        function (test, index) {

            const x =
                padding +
                (
                    index /
                    Math.max(
                        data.length - 1,
                        1
                    )
                ) *
                chartWidth;


            const y =
                height -
                padding -
                (
                    (
                        test.latency -
                        minimum
                    ) /
                    range
                ) *
                chartHeight;


            context.beginPath();


            context.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );


            context.fillStyle =
                "#2563eb";


            context.fill();

        }
    );


    // Maximum value

    context.fillStyle =
        "#6b7280";


    context.font =
        "12px Arial";


    context.textAlign =
        "left";


    context.fillText(
        maximum + " ms",
        5,
        padding
    );


    // Minimum value

    context.fillText(
        minimum + " ms",
        5,
        height - padding
    );

}


// ========================================
// 15. RUN REAL NETWORK TEST
// ========================================

async function runNetworkTest() {

    // Don't allow two tests at once

    if (isTesting) {

        return;

    }


    isTesting = true;


    statusElement.textContent =
        "Testing...";


    latencyElement.textContent =
        "Testing...";


    qualityElement.textContent =
        "Testing...";


    const startTime =
        performance.now();


    try {

        /*
            We send a real HTTP request.

            DummyJSON provides a simple
            test endpoint that responds
            to GET requests.
        */

        const response =
            await fetch(
                "https://dummyjson.com/test",
                {
                    method: "GET",

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server returned status " +
                response.status
            );

        }


        const endTime =
            performance.now();


        // Calculate real request time

        const realLatency =
            Math.round(
                endTime - startTime
            );


        // Calculate quality

        const networkQuality =
            getNetworkQuality(
                realLatency
            );


        // Current time

        const testTime =
            new Date()
                .toLocaleTimeString();


        // Update dashboard

        statusElement.textContent =
            "Connected 🟢";


        latencyElement.textContent =
            realLatency + " ms";


        qualityElement.textContent =
            networkQuality;


        // Create result

        const testResult = {

            time: testTime,

            latency: realLatency,

            quality: networkQuality

        };


        // Add result to history

        testHistory.push(
            testResult
        );


        // Keep history within limit

        limitHistory();


        // Save history

        saveHistory();


        // Update everything

        displayHistory();

        updateStatistics();

        displayNetworkInformation();

        updateHealth(realLatency);

        drawLatencyChart();


        console.log(
            "FlowGuard Test Result:",
            testResult
        );

    }

    catch (error) {

        statusElement.textContent =
            "Connection Failed 🔴";


        latencyElement.textContent =
            "--";


        qualityElement.textContent =
            "Unavailable";


        alertBox.textContent =
            "Network test failed. Check your internet connection.";


        alertBox.className =
            "alert-box danger";


        console.error(
            "FLOWGUARD NETWORK ERROR:",
            error
        );

    }

    finally {

        isTesting = false;

    }

}


// ========================================
// 16. MANUAL TEST
// ========================================

testButton.addEventListener(
    "click",
    runNetworkTest
);


// ========================================
// 17. START MONITORING
// ========================================

startMonitorButton.addEventListener(
    "click",
    function () {

        // Already running

        if (
            monitoringIntervalId !== null
        ) {

            return;

        }


        const seconds =
            Number(
                monitorInterval.value
            );


        const milliseconds =
            seconds * 1000;


        // Run immediately

        runNetworkTest();


        // Continue automatically

        monitoringIntervalId =
            setInterval(
                runNetworkTest,
                milliseconds
            );


        monitorStatus.textContent =
            "Monitoring is running 🟢";


        startMonitorButton.disabled =
            true;


        stopMonitorButton.disabled =
            false;

    }
);


// ========================================
// 18. STOP MONITORING
// ========================================

stopMonitorButton.addEventListener(
    "click",
    function () {

        if (
            monitoringIntervalId === null
        ) {

            return;

        }


        clearInterval(
            monitoringIntervalId
        );


        monitoringIntervalId = null;


        monitorStatus.textContent =
            "Monitoring is stopped.";


        startMonitorButton.disabled =
            false;


        stopMonitorButton.disabled =
            true;

    }
);


// ========================================
// 19. CLEAR HISTORY
// ========================================

clearHistoryButton.addEventListener(
    "click",
    function () {

        if (
            testHistory.length === 0
        ) {

            return;

        }


        const confirmed =
            confirm(
                "Clear all FlowGuard history?"
            );


        if (!confirmed) {

            return;

        }


        // Clear array

        testHistory.length = 0;


        // Remove localStorage data

        localStorage.removeItem(
            "flowguardHistory"
        );


        // Reset dashboard

        displayHistory();

        updateStatistics();

        drawLatencyChart();


        latencyElement.textContent =
            "-- ms";


        qualityElement.textContent =
            "--";


        healthIndicator.textContent =
            "● Healthy";


        healthIndicator.style.background =
            "#dcfce7";


        healthIndicator.style.color =
            "#166534";


        alertBox.textContent =
            "No network problems detected.";


        alertBox.className =
            "alert-box";

    }
);


// ========================================
// 20. EXPORT HISTORY AS CSV
// ========================================

exportButton.addEventListener(
    "click",
    function () {

        if (
            testHistory.length === 0
        ) {

            alert(
                "There is no history to export."
            );

            return;

        }


        let csv =
            "Time,Latency,Quality\n";


        testHistory.forEach(
            function (test) {

                csv +=
                    `"${test.time}",` +
                    `"${test.latency}",` +
                    `"${test.quality}"\n`;

            }
        );


        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");


        link.href = url;


        link.download =
            "flowguard-history.csv";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }
);


// ========================================
// 21. NETWORK INFORMATION CHANGE
// ========================================

if (connection) {

    connection.addEventListener(
        "change",
        function () {

            console.log(
                "Network information changed"
            );


            displayNetworkInformation();

        }
    );

}


// ========================================
// 22. ONLINE EVENT
// ========================================

window.addEventListener(
    "online",
    function () {

        onlineStatusElement.textContent =
            "Online 🟢";


        displayNetworkInformation();


        alertBox.textContent =
            "Internet connection restored.";


        alertBox.className =
            "alert-box";

    }
);


// ========================================
// 23. OFFLINE EVENT
// ========================================

window.addEventListener(
    "offline",
    function () {

        onlineStatusElement.textContent =
            "Offline 🔴";


        statusElement.textContent =
            "Offline 🔴";


        latencyElement.textContent =
            "--";


        qualityElement.textContent =
            "Unavailable";


        alertBox.textContent =
            "Your device is currently offline.";


        alertBox.className =
            "alert-box danger";


        displayNetworkInformation();

    }
);


// ========================================
// 24. LATENCY THRESHOLD CHANGE
// ========================================

latencyThresholdInput.addEventListener(
    "change",
    function () {

        if (
            testHistory.length > 0
        ) {

            const latestTest =
                testHistory[
                    testHistory.length - 1
                ];


            updateHealth(
                latestTest.latency
            );

        }

    }
);


// ========================================
// 25. MAX HISTORY CHANGE
// ========================================

maxHistoryInput.addEventListener(
    "change",
    function () {

        limitHistory();


        saveHistory();


        displayHistory();


        updateStatistics();


        drawLatencyChart();

    }
);


// ========================================
// 26. WINDOW RESIZE
// ========================================

window.addEventListener(
    "resize",
    function () {

        drawLatencyChart();

    }
);


// ========================================
// 27. INITIALIZE APPLICATION
// ========================================

function initializeApp() {

    // Display saved history

    displayHistory();


    // Calculate statistics

    updateStatistics();


    // Display network information

    displayNetworkInformation();


    // Draw chart

    drawLatencyChart();


    // Monitoring buttons

    startMonitorButton.disabled =
        false;


    stopMonitorButton.disabled =
        true;


    // Initial health

    healthIndicator.textContent =
        "● Healthy";


    alertBox.textContent =
        "No network problems detected.";

}
function getUserData(userId) {
  const password = "admin123";

  if (userId) {
    console.log("User ID:", userId);
  }

  return password;
}


// ========================================
// START FLOWGUARD
// ========================================

initializeApp();
