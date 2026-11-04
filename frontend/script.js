/* =========================================================
   BRAIN TUMOR AI DETECTION SYSTEM
   UPGRADED SCRIPT.JS

   Works with:
   - index.html
   - upgraded style.css
   - Flask app.py
   - Vision Transformer
   - Chart.js
   - jsPDF
   - Voice Assistant
   - Prediction History
   - Dark Mode
   - Responsive Sidebar
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_URL = "http://127.0.0.1:5000";

const PREDICTION_TIMEOUT = 120000; // 2 minutes

let probabilityChart = null;

let isPredicting = false;


/* =========================================================
   CURRENT PREDICTION
   ========================================================= */

let currentPrediction = {

    prediction: "",

    confidence: 0,

    probabilities: {

        "Glioma": 0,

        "Meningioma": 0,

        "Pituitary": 0,

        "No Tumor": 0

    },

    image: "",

    date: "",

    time: "",

    inferenceTime: 0,

    totalTime: 0

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🧠 Brain Tumor AI frontend starting..."
        );


        setupNavigation();

        setupMobileMenu();

        setupMRIUpload();

        setupButtons();

        setupSettings();

        setupDarkMode();

        setupVoiceAssistant();

        loadHistory();

        checkBackend();

        initializeDashboard();


        console.log(
            "✅ Brain Tumor AI frontend initialized."
        );

    }
);


/* =========================================================
   SAFE ELEMENT HELPER
   ========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   SAFE TEXT UPDATE
   ========================================================= */

function setText(id, value) {

    const element =
        getElement(id);

    if (element) {

        element.innerText =
            value;

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    navItems.forEach(
                        function (nav) {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );

                }
            );

        }
    );


    /* -----------------------------------------------------
       Highlight section while scrolling
       ----------------------------------------------------- */

    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    if (
        "IntersectionObserver"
        in window
    ) {

        const observer =
            new IntersectionObserver(

                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                const id =
                                    entry.target.id;


                                navItems.forEach(
                                    function (item) {

                                        item.classList.remove(
                                            "active"
                                        );


                                        const href =
                                            item.getAttribute(
                                                "href"
                                            );


                                        if (
                                            href ===
                                            `#${id}`
                                        ) {

                                            item.classList.add(
                                                "active"
                                            );

                                        }

                                    }
                                );

                            }

                        }
                    );

                },

                {
                    threshold: 0.2
                }

            );


        sections.forEach(
            function (section) {

                observer.observe(
                    section
                );

            }
        );

    }

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const menuBtn =
        getElement("menuBtn");

    const sidebar =
        getElement("sidebar");


    if (
        !menuBtn ||
        !sidebar
    ) {

        return;

    }


    menuBtn.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );


    const navLinks =
        sidebar.querySelectorAll(
            "a"
        );


    navLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    sidebar.classList.remove(
                        "mobile-open"
                    );

                }
            );

        }
    );

}


/* =========================================================
   MRI UPLOAD
   ========================================================= */

function setupMRIUpload() {

    const imageInput =
        getElement("imageInput");

    const preview =
        getElement("preview");

    const previewPlaceholder =
        getElement(
            "previewPlaceholder"
        );

    const predictBtn =
        getElement("predictBtn");

    const selectedFile =
        getElement("selectedFile");


    if (!imageInput) {

        console.error(
            "❌ imageInput not found."
        );

        return;

    }


    imageInput.addEventListener(
        "change",
        function () {

            console.log(
                "📁 MRI file selection changed."
            );


            if (
                !this.files ||
                this.files.length === 0
            ) {

                resetImageSelection();

                return;

            }


            const file =
                this.files[0];


            console.log(
                "Selected file:",
                file.name
            );


            console.log(
                "File type:",
                file.type
            );


            console.log(
                "File size:",
                formatFileSize(
                    file.size
                )
            );


            /* ------------------------------------------------
               Validate file type
               ------------------------------------------------ */

            const allowedTypes = [

                "image/jpeg",

                "image/jpg",

                "image/png"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a JPG, JPEG, or PNG image."
                );


                imageInput.value = "";

                resetImageSelection();

                return;

            }


            /* ------------------------------------------------
               Validate file size
               ------------------------------------------------ */

            const maxSize =
                20 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                alert(
                    "Image is too large.\n\n" +
                    "Maximum allowed size is 20 MB."
                );


                imageInput.value = "";

                resetImageSelection();

                return;

            }


            /* ------------------------------------------------
               Display filename
               ------------------------------------------------ */

            if (selectedFile) {

                selectedFile.innerText =
                    `Selected: ${file.name}`;

            }


            /* ------------------------------------------------
               Create preview
               ------------------------------------------------ */

            const imageURL =
                URL.createObjectURL(
                    file
                );


            if (preview) {

                preview.onload =
                    function () {

                        console.log(
                            "✅ MRI preview displayed."
                        );


                        preview.style.display =
                            "block";


                        if (
                            previewPlaceholder
                        ) {

                            previewPlaceholder.style.display =
                                "none";

                        }

                    };


                preview.onerror =
                    function () {

                        console.error(
                            "❌ Could not display image."
                        );


                        if (
                            previewPlaceholder
                        ) {

                            previewPlaceholder.style.display =
                                "flex";

                        }

                    };


                preview.src =
                    imageURL;

            }


            /* ------------------------------------------------
               Enable prediction
               ------------------------------------------------ */

            if (predictBtn) {

                predictBtn.disabled =
                    false;

                predictBtn.innerHTML =
                    "🔍 Analyze MRI";

            }


            /* ------------------------------------------------
               Reset old prediction
               ------------------------------------------------ */

            resetPredictionDisplay();


            setText(
                "analysisStatus",
                "MRI image selected"
            );


            /* ------------------------------------------------
               Store image as Data URL
               ------------------------------------------------ */

            convertFileToDataURL(
                file
            )
            .then(
                function (dataURL) {

                    currentPrediction.image =
                        dataURL;

                }
            )
            .catch(
                function (error) {

                    console.warn(
                        "Could not store image preview.",
                        error
                    );

                }
            );

        }
    );

}


/* =========================================================
   RESET IMAGE
   ========================================================= */

function resetImageSelection() {

    const preview =
        getElement("preview");

    const placeholder =
        getElement(
            "previewPlaceholder"
        );

    const predictBtn =
        getElement("predictBtn");

    const selectedFile =
        getElement("selectedFile");


    if (preview) {

        preview.removeAttribute(
            "src"
        );

        preview.style.display =
            "none";

    }


    if (placeholder) {

        placeholder.style.display =
            "flex";

    }


    if (predictBtn) {

        predictBtn.disabled =
            true;

        predictBtn.innerHTML =
            "🔍 Analyze MRI";

    }


    if (selectedFile) {

        selectedFile.innerText =
            "No image selected";

    }


    currentPrediction.image =
        "";

}


/* =========================================================
   RESET PREDICTION DISPLAY
   ========================================================= */

function resetPredictionDisplay() {

    setText(
        "predictionText",
        "Ready for analysis"
    );


    setText(
        "confidenceText",
        "--"
    );


    setText(
        "analysisStatus",
        "Waiting for image"
    );


    setText(
        "resultDateTime",
        "--"
    );


    setText(
        "reportDate",
        "--"
    );


    setText(
        "reportTime",
        "--"
    );


    setText(
        "reportPrediction",
        "No prediction"
    );


    setText(
        "reportConfidence",
        "--"
    );


    setText(
        "diseaseName",
        "Waiting for prediction"
    );


    const diseaseDescription =
        getElement(
            "diseaseDescription"
        );


    if (diseaseDescription) {

        diseaseDescription.innerHTML = `

            <p>
                Disease information will appear after
                the MRI prediction.
            </p>

        `;

    }


    setText(
        "xaiExplanation",
        ""
    );


    const xaiExplanation =
        getElement(
            "xaiExplanation"
        );


    if (xaiExplanation) {

        xaiExplanation.innerHTML = `

            <p>
                Upload and analyze an MRI to generate
                an explanation.
            </p>

        `;

    }


    if (probabilityChart) {

        probabilityChart.destroy();

        probabilityChart =
            null;

    }


    const chartMessage =
        getElement(
            "chartMessage"
        );


    if (chartMessage) {

        chartMessage.style.display =
            "block";

    }

}


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

    const predictBtn =
        getElement("predictBtn");


    if (predictBtn) {

        predictBtn.addEventListener(
            "click",
            predict
        );

    }


    const clearHistoryBtn =
        getElement(
            "clearHistoryBtn"
        );


    if (clearHistoryBtn) {

        clearHistoryBtn.addEventListener(
            "click",
            clearHistory
        );

    }


    const reportBtn =
        getElement(
            "downloadReportBtn"
        );


    if (reportBtn) {

        reportBtn.addEventListener(
            "click",
            downloadPDFReport
        );

    }


    const speakBtn =
        getElement("speakBtn");


    if (speakBtn) {

        speakBtn.addEventListener(
            "click",
            function () {

                if (
                    currentPrediction.prediction
                ) {

                    speakPrediction(

                        currentPrediction.prediction,

                        currentPrediction.confidence

                    );

                }
                else {

                    alert(
                        "Please analyze an MRI first."
                    );

                }

            }
        );

    }


    const stopVoiceBtn =
        getElement(
            "stopVoiceBtn"
        );


    if (stopVoiceBtn) {

        stopVoiceBtn.addEventListener(
            "click",
            stopVoice
        );

    }

}


/* =========================================================
   MAIN PREDICTION
   ========================================================= */

async function predict() {

    if (isPredicting) {

        console.warn(
            "Prediction already running."
        );

        return;

    }


    const imageInput =
        getElement("imageInput");

    const predictBtn =
        getElement("predictBtn");

    const loadingMessage =
        getElement(
            "loadingMessage"
        );


    /* -------------------------------------------------------
       Check file
       ------------------------------------------------------- */

    if (
        !imageInput ||
        !imageInput.files ||
        imageInput.files.length === 0
    ) {

        alert(
            "Please select an MRI image first."
        );

        return;

    }


    const file =
        imageInput.files[0];


    isPredicting =
        true;


    /* -------------------------------------------------------
       Loading UI
       ------------------------------------------------------- */

    setPredictionLoadingState(
        true
    );


    console.log(
        "======================================"
    );

    console.log(
        "🧠 STARTING MRI PREDICTION"
    );

    console.log(
        "File:",
        file.name
    );

    console.log(
        "Size:",
        formatFileSize(
            file.size
        )
    );

    console.log(
        "Type:",
        file.type
    );

    console.log(
        "API:",
        `${API_URL}/predict`
    );

    console.log(
        "======================================"
    );


    try {

        /* ---------------------------------------------------
           FormData
           --------------------------------------------------- */

        const formData =
            new FormData();


        formData.append(
            "image",
            file
        );


        /* ---------------------------------------------------
           AbortController
           --------------------------------------------------- */

        const controller =
            new AbortController();


        const timeoutId =
            setTimeout(
                function () {

                    controller.abort();

                },
                PREDICTION_TIMEOUT
            );


        let response;


        try {

            response =
                await fetch(

                    `${API_URL}/predict`,

                    {

                        method:
                            "POST",

                        body:
                            formData,

                        signal:
                            controller.signal

                    }

                );

        }

        finally {

            clearTimeout(
                timeoutId
            );

        }


        console.log(
            "📥 Flask HTTP status:",
            response.status
        );


        /* ---------------------------------------------------
           Read response
           --------------------------------------------------- */

        const responseText =
            await response.text();


        console.log(
            "Raw Flask response:",
            responseText
        );


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (jsonError) {

            throw new Error(
                "Flask returned an invalid response. " +
                "Check the Flask terminal."
            );

        }


        /* ---------------------------------------------------
           HTTP error
           --------------------------------------------------- */

        if (!response.ok) {

            throw new Error(

                data.error ||

                `Flask server returned HTTP ${response.status}`

            );

        }


        /* ---------------------------------------------------
           Flask error
           --------------------------------------------------- */

        if (data.error) {

            throw new Error(
                data.error
            );

        }


        if (
            data.success === false
        ) {

            throw new Error(
                data.error ||
                "Prediction failed."
            );

        }


        console.log(
            "✅ Parsed Flask response:",
            data
        );


        /* ===================================================
           GET PREDICTION
           =================================================== */

        const rawPrediction =
            data.prediction ||
            data.class ||
            data.label ||
            "Unknown";


        const prediction =
            formatDiseaseName(
                rawPrediction
            );


        /* ===================================================
           GET CONFIDENCE
           =================================================== */

        let confidence =
            parseFloat(
                data.confidence
            );


        if (
            !Number.isFinite(
                confidence
            )
        ) {

            confidence = 0;

        }


        if (
            confidence <= 1
        ) {

            confidence *=
                100;

        }


        confidence =
            Math.min(
                100,
                Math.max(
                    0,
                    confidence
                )
            );


        confidence =
            Number(
                confidence.toFixed(2)
            );


        /* ===================================================
           GET PROBABILITIES
           =================================================== */

        const probabilities =
            extractProbabilities(
                data
            );


        /* ===================================================
           DATE AND TIME
           =================================================== */

        const now =
            new Date();


        const date =
            now.toLocaleDateString();


        const time =
            now.toLocaleTimeString();


        /* ===================================================
           SAVE CURRENT PREDICTION
           =================================================== */

        currentPrediction = {

            prediction:
                prediction,

            confidence:
                confidence,

            probabilities:
                probabilities,

            image:
                currentPrediction.image,

            date:
                date,

            time:
                time,

            inferenceTime:
                Number(
                    data.inference_time ||
                    0
                ),

            totalTime:
                Number(
                    data.total_time ||
                    0
                )

        };


        /* ===================================================
           UPDATE UI
           =================================================== */

        setText(
            "predictionText",
            prediction
        );


        setText(
            "confidenceText",
            `${confidence}%`
        );


        setText(
            "analysisStatus",
            "Prediction completed successfully."
        );


        setText(
            "resultDateTime",
            now.toLocaleString()
        );


        /* ===================================================
           REPORT
           =================================================== */

        updateReportInformation();


        /* ===================================================
           CHART
           =================================================== */

        createProbabilityChart(
            probabilities
        );


        /* ===================================================
           DISEASE INFORMATION
           =================================================== */

        updateDiseaseInformation(
            rawPrediction
        );


        /* ===================================================
           EXPLAINABLE AI
           =================================================== */

        updateExplainableAI(
            currentPrediction
        );


        /* ===================================================
           DASHBOARD COUNTERS
           =================================================== */

        updateDashboardCounters(
            prediction
        );


        /* ===================================================
           HISTORY
           =================================================== */

        saveHistory(
            currentPrediction
        );


        /* ===================================================
           VOICE
           =================================================== */

        const voiceToggle =
            getElement(
                "voiceToggle"
            );


        if (
            voiceToggle &&
            voiceToggle.checked
        ) {

            speakPrediction(

                prediction,

                confidence

            );

        }


        /* ===================================================
           SUCCESS
           =================================================== */

        console.log(
            "======================================"
        );

        console.log(
            "🎉 PREDICTION SUCCESSFUL"
        );

        console.log(
            "Prediction:",
            prediction
        );

        console.log(
            "Confidence:",
            `${confidence}%`
        );

        console.log(
            "Probabilities:",
            probabilities
        );

        console.log(
            "======================================"
        );


        showNotification(
            "MRI analysis completed successfully.",
            "success"
        );

    }


    catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "❌ PREDICTION ERROR"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );


        setText(
            "predictionText",
            "Prediction Failed"
        );


        setText(
            "confidenceText",
            "--"
        );


        setText(
            "analysisStatus",
            "Prediction failed."
        );


        /* ---------------------------------------------------
           Timeout
           --------------------------------------------------- */

        if (
            error.name ===
            "AbortError"
        ) {

            alert(

                "The AI prediction took longer than 2 minutes.\n\n" +

                "Please check the Flask terminal.\n\n" +

                "If Flask is stuck at 'Running Vision Transformer', " +

                "the issue is probably with model inference."

            );

        }


        /* ---------------------------------------------------
           Connection error
           --------------------------------------------------- */

        else if (
            error instanceof
            TypeError
        ) {

            alert(

                "Cannot connect to Flask.\n\n" +

                "Make sure app.py is running at:\n" +

                "http://127.0.0.1:5000"

            );

        }


        else {

            alert(

                "Prediction failed.\n\n" +

                error.message

            );

        }


        showNotification(
            "MRI analysis failed.",
            "error"
        );

    }


    finally {

        isPredicting =
            false;


        setPredictionLoadingState(
            false
        );

    }

}


/* =========================================================
   PREDICTION LOADING STATE
   ========================================================= */

function setPredictionLoadingState(
    loading
) {

    const predictBtn =
        getElement("predictBtn");

    const loadingMessage =
        getElement(
            "loadingMessage"
        );


    if (loading) {

        if (predictBtn) {

            predictBtn.disabled =
                true;

            predictBtn.innerHTML =
                "⏳ Analyzing MRI...";

        }


        if (loadingMessage) {

            loadingMessage.hidden =
                false;

        }


        setText(
            "predictionText",
            "Processing MRI..."
        );


        setText(
            "confidenceText",
            "Please wait..."
        );


        setText(
            "analysisStatus",
            "Vision Transformer is analyzing the MRI..."
        );

    }

    else {

        if (loadingMessage) {

            loadingMessage.hidden =
                true;

        }


        if (predictBtn) {

            predictBtn.disabled =
                false;

            predictBtn.innerHTML =
                currentPrediction.prediction
                    ? "🔄 Analyze Again"
                    : "🔍 Analyze MRI";

        }

    }

}


/* =========================================================
   FORMAT DISEASE NAME
   ========================================================= */

function formatDiseaseName(
    name
) {

    if (!name) {

        return "Unknown";

    }


    const value =
        String(name)
            .trim()
            .toLowerCase()
            .replace(
                /[_-]/g,
                " "
            );


    const names = {

        "glioma":
            "Glioma Tumor",

        "glioma tumor":
            "Glioma Tumor",

        "meningioma":
            "Meningioma Tumor",

        "meningioma tumor":
            "Meningioma Tumor",

        "pituitary":
            "Pituitary Tumor",

        "pituitary tumor":
            "Pituitary Tumor",

        "notumor":
            "No Tumor",

        "no tumor":
            "No Tumor"

    };


    return (
        names[value] ||
        String(name)
    );

}


/* =========================================================
   EXTRACT PROBABILITIES
   ========================================================= */

function extractProbabilities(
    data
) {

    const result = {

        "Glioma": 0,

        "Meningioma": 0,

        "Pituitary": 0,

        "No Tumor": 0

    };


    /* -------------------------------------------------------
       New Flask format
       ------------------------------------------------------- */

    if (
        data.probabilities &&
        typeof data.probabilities ===
        "object"
    ) {

        const probabilities =
            data.probabilities;


        Object.keys(
            probabilities
        ).forEach(
            function (key) {

                let value =
                    parseFloat(
                        probabilities[key]
                    );


                if (
                    !Number.isFinite(
                        value
                    )
                ) {

                    return;

                }


                if (
                    value <= 1
                ) {

                    value *=
                        100;

                }


                const lower =
                    key
                        .toLowerCase()
                        .replace(
                            /[_-]/g,
                            " "
                        );


                if (
                    lower.includes(
                        "glioma"
                    )
                ) {

                    result.Glioma =
                        value;

                }

                else if (
                    lower.includes(
                        "meningioma"
                    )
                ) {

                    result.Meningioma =
                        value;

                }

                else if (
                    lower.includes(
                        "pituitary"
                    )
                ) {

                    result.Pituitary =
                        value;

                }

                else if (
                    lower.includes(
                        "notumor"
                    ) ||
                    lower.includes(
                        "no tumor"
                    )
                ) {

                    result["No Tumor"] =
                        value;

                }

            }
        );

    }


    /* -------------------------------------------------------
       Old Flask format fallback
       ------------------------------------------------------- */

    else {

        const oldFormat = {

            "Glioma":
                data.glioma,

            "Meningioma":
                data.meningioma,

            "Pituitary":
                data.pituitary,

            "No Tumor":
                data.notumor

        };


        Object.keys(
            oldFormat
        ).forEach(
            function (key) {

                let value =
                    parseFloat(
                        oldFormat[key]
                    );


                if (
                    !Number.isFinite(
                        value
                    )
                ) {

                    value = 0;

                }


                if (
                    value <= 1
                ) {

                    value *=
                        100;

                }


                result[key] =
                    value;

            }
        );

    }


    return result;

}


/* =========================================================
   CHART.JS
   ========================================================= */

function createProbabilityChart(
    probabilities
) {

    const canvas =
        getElement("myChart");


    const chartMessage =
        getElement(
            "chartMessage"
        );


    if (!canvas) {

        console.warn(
            "myChart canvas not found."
        );

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return;

    }


    if (probabilityChart) {

        probabilityChart.destroy();

        probabilityChart =
            null;

    }


    if (chartMessage) {

        chartMessage.style.display =
            "none";

    }


    probabilityChart =
        new Chart(

            canvas,

            {

                type:
                    "bar",


                data: {

                    labels: [

                        "Glioma",

                        "Meningioma",

                        "Pituitary",

                        "No Tumor"

                    ],


                    datasets: [

                        {

                            label:
                                "Probability (%)",


                            data: [

                                probabilities.Glioma,

                                probabilities.Meningioma,

                                probabilities.Pituitary,

                                probabilities["No Tumor"]

                            ],


                            borderWidth:
                                1

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    animation: {

                        duration:
                            800

                    },


                    plugins: {

                        legend: {

                            display:
                                true

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (

                                            "Probability: " +

                                            Number(
                                                context.raw
                                            ).toFixed(2) +

                                            "%"

                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            max:
                                100,


                            title: {

                                display:
                                    true,

                                text:
                                    "Probability (%)"

                            }

                        },


                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Brain MRI Class"

                            }

                        }

                    }

                }

            }

        );

}


/* =========================================================
   EXPLAINABLE AI
   ========================================================= */

function updateExplainableAI(
    result
) {

    const explanation =
        getElement(
            "xaiExplanation"
        );


    if (!explanation) {

        return;

    }


    const topClass =
        result.prediction;


    const confidence =
        result.confidence;


    explanation.innerHTML = `

        <div class="xai-result">

            <h3>
                🔥 AI Decision Explanation
            </h3>

            <p>
                The Vision Transformer classified
                the uploaded MRI as
                <strong>
                    ${escapeHTML(topClass)}
                </strong>.
            </p>

            <p>
                Model confidence:
                <strong>
                    ${escapeHTML(confidence)}%
                </strong>
            </p>

            <hr>

            <h4>
                Probability Distribution
            </h4>

            <p>
                Glioma:
                <strong>
                    ${result.probabilities.Glioma.toFixed(2)}%
                </strong>
            </p>

            <p>
                Meningioma:
                <strong>
                    ${result.probabilities.Meningioma.toFixed(2)}%
                </strong>
            </p>

            <p>
                Pituitary:
                <strong>
                    ${result.probabilities.Pituitary.toFixed(2)}%
                </strong>
            </p>

            <p>
                No Tumor:
                <strong>
                    ${result.probabilities["No Tumor"].toFixed(2)}%
                </strong>
            </p>

            <div class="medical-warning">

                ⚠️ This is an AI model interpretation
                for educational/research purposes and
                is not a medical diagnosis.

            </div>

        </div>

    `;

}


/* =========================================================
   DISEASE INFORMATION
   ========================================================= */

function updateDiseaseInformation(
    disease
) {

    const diseaseName =
        getElement(
            "diseaseName"
        );


    const description =
        getElement(
            "diseaseDescription"
        );


    const normalized =
        String(disease)
            .toLowerCase()
            .replace(
                /[_-]/g,
                " "
            );


    const information = {

        "glioma": {

            name:
                "Glioma Tumor",

            description:
                "Gliomas are tumors that arise from glial cells in the nervous system. The exact type, grade, location, and treatment approach must be determined by qualified medical professionals."

        },


        "meningioma": {

            name:
                "Meningioma Tumor",

            description:
                "Meningiomas develop from the meninges, the protective layers surrounding the brain and spinal cord. Clinical assessment and imaging review are required for diagnosis and treatment decisions."

        },


        "pituitary": {

            name:
                "Pituitary Tumor",

            description:
                "Pituitary tumors occur in or around the pituitary gland. Their clinical significance varies, and professional medical evaluation is required."

        },


        "notumor": {

            name:
                "No Tumor",

            description:
                "The AI model classified the uploaded MRI into the no-tumor category. This result does not rule out every possible medical condition and should not replace professional review."

        }

    };


    let selected =
        null;


    if (
        normalized.includes(
            "glioma"
        )
    ) {

        selected =
            information.glioma;

    }

    else if (
        normalized.includes(
            "meningioma"
        )
    ) {

        selected =
            information.meningioma;

    }

    else if (
        normalized.includes(
            "pituitary"
        )
    ) {

        selected =
            information.pituitary;

    }

    else if (
        normalized.includes(
            "notumor"
        ) ||
        normalized.includes(
            "no tumor"
        )
    ) {

        selected =
            information.notumor;

    }


    if (!selected) {

        return;

    }


    if (diseaseName) {

        diseaseName.innerText =
            selected.name;

    }


    if (description) {

        description.innerHTML = `

            <p>
                ${escapeHTML(
                    selected.description
                )}
            </p>

            <div class="medical-warning">

                ⚠️ Educational information only.
                A qualified healthcare professional
                must interpret MRI findings.

            </div>

        `;

    }

}


/* =========================================================
   REPORT INFORMATION
   ========================================================= */

function updateReportInformation() {

    setText(
        "reportDate",
        currentPrediction.date
    );


    setText(
        "reportTime",
        currentPrediction.time
    );


    setText(
        "reportPrediction",
        currentPrediction.prediction
    );


    setText(
        "reportConfidence",
        `${currentPrediction.confidence}%`
    );

}


/* =========================================================
   DASHBOARD COUNTERS
   ========================================================= */

function initializeDashboard() {

    const history =
        getStoredHistory();


    const total =
        history.length;


    const tumorCases =
        history.filter(
            function (item) {

                return (
                    item.prediction !==
                    "No Tumor"
                );

            }
        ).length;


    const noTumorCases =
        history.filter(
            function (item) {

                return (
                    item.prediction ===
                    "No Tumor"
                );

            }
        ).length;


    setText(
        "totalScans",
        total
    );


    setText(
        "tumorCases",
        tumorCases
    );


    setText(
        "noTumorCases",
        noTumorCases
    );

}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

function updateDashboardCounters(
    prediction
) {

    initializeDashboard();

}


/* =========================================================
   HISTORY STORAGE
   ========================================================= */

function getStoredHistory() {

    try {

        return (
            JSON.parse(
                localStorage.getItem(
                    "brainTumorHistory"
                )
            ) || []
        );

    }

    catch (error) {

        console.warn(
            "Could not read history.",
            error
        );


        return [];

    }

}


/* =========================================================
   SAVE HISTORY
   ========================================================= */

function saveHistory(
    result
) {

    let history =
        getStoredHistory();


    history.unshift({

        prediction:
            result.prediction,

        confidence:
            result.confidence,

        date:
            result.date,

        time:
            result.time

    });


    history =
        history.slice(
            0,
            20
        );


    localStorage.setItem(

        "brainTumorHistory",

        JSON.stringify(
            history
        )

    );


    displayHistory(
        history
    );


    initializeDashboard();

}


/* =========================================================
   LOAD HISTORY
   ========================================================= */

function loadHistory() {

    const history =
        getStoredHistory();


    displayHistory(
        history
    );


    initializeDashboard();

}


/* =========================================================
   DISPLAY HISTORY
   ========================================================= */

function displayHistory(
    history
) {

    const container =
        getElement(
            "historyList"
        );


    if (!container) {

        return;

    }


    if (
        !history ||
        history.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-history">

                📜

                <p>
                    No prediction history available.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    history.forEach(
        function (
            item,
            index
        ) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "history-item";


            div.innerHTML = `

                <div>

                    <h3>
                        ${escapeHTML(
                            item.prediction
                        )}
                    </h3>

                    <p>
                        Confidence:
                        <strong>
                            ${escapeHTML(
                                item.confidence
                            )}%
                        </strong>
                    </p>

                    <small>
                        📅 ${escapeHTML(
                            item.date
                        )}

                        &nbsp;&nbsp;

                        🕐 ${escapeHTML(
                            item.time
                        )}
                    </small>

                </div>

                <span>
                    #${index + 1}
                </span>

            `;


            container.appendChild(
                div
            );

        }
    );

}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

function clearHistory() {

    const confirmed =
        confirm(
            "Are you sure you want to clear all prediction history?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        "brainTumorHistory"
    );


    displayHistory(
        []
    );


    initializeDashboard();


    showNotification(
        "Prediction history cleared.",
        "success"
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function setupSettings() {

    const darkModeToggle =
        getElement(
            "darkModeToggle"
        );


    const voiceToggle =
        getElement(
            "voiceToggle"
        );


    const notificationToggle =
        getElement(
            "notificationToggle"
        );


    const reportToggle =
        getElement(
            "reportToggle"
        );


    /* -------------------------------------------------------
       Dark Mode
       ------------------------------------------------------- */

    if (darkModeToggle) {

        darkModeToggle.addEventListener(
            "change",
            function () {

                applyDarkMode(
                    this.checked
                );

            }
        );

    }


    /* -------------------------------------------------------
       Voice
       ------------------------------------------------------- */

    if (voiceToggle) {

        voiceToggle.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "brainTumorVoice",
                    this.checked
                );

            }
        );

    }


    /* -------------------------------------------------------
       Notifications
       ------------------------------------------------------- */

    if (
        notificationToggle
    ) {

        notificationToggle.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "brainTumorNotifications",
                    this.checked
                );

            }
        );

    }


    /* -------------------------------------------------------
       Report
       ------------------------------------------------------- */

    if (reportToggle) {

        reportToggle.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "brainTumorAutoReport",
                    this.checked
                );

            }
        );

    }


    /* -------------------------------------------------------
       Load saved values
       ------------------------------------------------------- */

    const savedVoice =
        localStorage.getItem(
            "brainTumorVoice"
        );


    if (
        voiceToggle &&
        savedVoice !== null
    ) {

        voiceToggle.checked =
            savedVoice === "true";

    }


    const savedNotifications =
        localStorage.getItem(
            "brainTumorNotifications"
        );


    if (
        notificationToggle &&
        savedNotifications !== null
    ) {

        notificationToggle.checked =
            savedNotifications === "true";

    }


    const savedReport =
        localStorage.getItem(
            "brainTumorAutoReport"
        );


    if (
        reportToggle &&
        savedReport !== null
    ) {

        reportToggle.checked =
            savedReport === "true";

    }

}


/* =========================================================
   DARK MODE
   ========================================================= */

function setupDarkMode() {

    const toggle =
        getElement(
            "darkModeToggle"
        );


    const saved =
        localStorage.getItem(
            "brainTumorDarkMode"
        );


    let darkMode =
        true;


    if (
        saved !== null
    ) {

        darkMode =
            saved === "true";

    }


    applyDarkMode(
        darkMode
    );


    if (toggle) {

        toggle.checked =
            darkMode;

    }

}


/* =========================================================
   APPLY DARK MODE
   ========================================================= */

function applyDarkMode(
    enabled
) {

    if (enabled) {

        document.body.classList.remove(
            "light-mode"
        );

    }

    else {

        document.body.classList.add(
            "light-mode"
        );

    }


    localStorage.setItem(

        "brainTumorDarkMode",

        enabled

    );

}


/* =========================================================
   VOICE ASSISTANT
   ========================================================= */

function setupVoiceAssistant() {

    if (
        !("speechSynthesis" in window)
    ) {

        console.warn(
            "Speech synthesis not supported."
        );

    }

}


/* =========================================================
   SPEAK PREDICTION
   ========================================================= */

function speakPrediction(
    disease,
    confidence
) {

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Voice Assistant is not supported by this browser."
        );

        return;

    }


    stopVoice();


    const text =

        `MRI analysis completed. ` +

        `The predicted class is ` +

        `${disease}. ` +

        `The model confidence is ` +

        `${confidence} percent.`;


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.rate =
        0.9;


    speech.pitch =
        1;


    speech.volume =
        1;


    window.speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   STOP VOICE
   ========================================================= */

function stopVoice() {

    if (
        "speechSynthesis"
        in window
    ) {

        window.speechSynthesis.cancel();

    }

}


/* =========================================================
   BACKEND HEALTH CHECK
   ========================================================= */

async function checkBackend() {

    console.log(
        "🔎 Checking Flask backend..."
    );


    try {

        const response =
            await fetch(
                `${API_URL}/health`,
                {
                    method:
                        "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "✅ Flask backend is online:",
            data
        );


        updateBackendStatus(
            true
        );

    }


    catch (error) {

        console.warn(
            "⚠️ Flask backend is not reachable.",
            error
        );


        updateBackendStatus(
            false
        );

    }

}


/* =========================================================
   BACKEND STATUS UI
   ========================================================= */

function updateBackendStatus(
    online
) {

    const badge =
        document.querySelector(
            ".status-badge"
        );


    if (!badge) {

        return;

    }


    if (online) {

        badge.innerHTML = `

            <span class="status-dot"></span>

            Backend Connected

        `;

        badge.classList.remove(
            "backend-offline"
        );

    }

    else {

        badge.innerHTML = `

            <span class="status-dot"></span>

            Backend Offline

        `;

        badge.classList.add(
            "backend-offline"
        );

    }

}


/* =========================================================
   PDF REPORT
   ========================================================= */

async function downloadPDFReport() {

    if (
        !currentPrediction.prediction
    ) {

        alert(
            "Please analyze an MRI before downloading the report."
        );

        return;

    }


    const reportButton =
        getElement(
            "downloadReportBtn"
        );


    try {

        if (reportButton) {

            reportButton.disabled =
                true;

            reportButton.innerText =
                "⏳ Creating PDF...";

        }


        /* ---------------------------------------------------
           Load jsPDF
           --------------------------------------------------- */

        if (
            typeof window.jspdf ===
            "undefined"
        ) {

            await loadJsPDF();

        }


        const {
            jsPDF
        } =
            window.jspdf;


        const pdf =
            new jsPDF();


        const now =
            new Date();


        /* ---------------------------------------------------
           Header
           --------------------------------------------------- */

        pdf.setFontSize(
            20
        );


        pdf.text(
            "Brain Tumor AI",
            20,
            20
        );


        pdf.setFontSize(
            14
        );


        pdf.text(
            "Brain MRI Classification Report",
            20,
            31
        );


        pdf.setFontSize(
            10
        );


        pdf.text(
            `Date: ${currentPrediction.date}`,
            20,
            42
        );


        pdf.text(
            `Time: ${currentPrediction.time}`,
            20,
            49
        );


        pdf.line(
            20,
            55,
            190,
            55
        );


        /* ---------------------------------------------------
           Prediction
           --------------------------------------------------- */

        pdf.setFontSize(
            15
        );


        pdf.text(
            "Prediction Result",
            20,
            68
        );


        pdf.setFontSize(
            12
        );


        pdf.text(
            `Predicted Class: ${currentPrediction.prediction}`,
            20,
            80
        );


        pdf.text(
            `Confidence: ${currentPrediction.confidence}%`,
            20,
            90
        );


        /* ---------------------------------------------------
           Probabilities
           --------------------------------------------------- */

        pdf.setFontSize(
            15
        );


        pdf.text(
            "Class Probabilities",
            20,
            108
        );


        pdf.setFontSize(
            11
        );


        let y =
            120;


        Object.entries(
            currentPrediction.probabilities
        ).forEach(
            function (
                [name, value]
            ) {

                pdf.text(

                    `${name}: ${Number(value).toFixed(2)}%`,

                    25,

                    y

                );


                y +=
                    8;

            }
        );


        /* ---------------------------------------------------
           MRI image
           --------------------------------------------------- */

        if (
            currentPrediction.image
        ) {

            try {

                pdf.setFontSize(
                    14
                );


                pdf.text(
                    "MRI Image",
                    20,
                    y + 10
                );


                pdf.addImage(

                    currentPrediction.image,

                    "JPEG",

                    20,

                    y + 18,

                    70,

                    70

                );


                y +=
                    100;

            }

            catch (imageError) {

                console.warn(
                    "Could not add MRI image.",
                    imageError
                );

            }

        }


        /* ---------------------------------------------------
           Technical information
           --------------------------------------------------- */

        pdf.setFontSize(
            11
        );


        pdf.text(
            "Model: Vision Transformer",
            110,
            125
        );


        pdf.text(
            "Task: Multi-Class Classification",
            110,
            133
        );


        if (
            currentPrediction.inferenceTime
        ) {

            pdf.text(
                `Inference: ${currentPrediction.inferenceTime}s`,
                110,
                141
            );

        }


        /* ---------------------------------------------------
           Disclaimer
           --------------------------------------------------- */

        pdf.setFontSize(
            9
        );


        const disclaimer =

            "Educational and research use only. " +

            "This AI prediction does not replace " +

            "diagnosis or advice from a qualified " +

            "medical professional.";


        const disclaimerLines =
            pdf.splitTextToSize(
                disclaimer,
                170
            );


        pdf.text(

            disclaimerLines,

            20,

            Math.min(
                y + 10,
                260
            )

        );


        /* ---------------------------------------------------
           Filename
           --------------------------------------------------- */

        const safeDisease =
            currentPrediction.prediction
                .replace(
                    /[^a-z0-9]/gi,
                    "_"
                );


        const filename =

            `Brain_Tumor_AI_Report_` +

            `${safeDisease}_` +

            `${now.getTime()}.pdf`;


        pdf.save(
            filename
        );


        showNotification(
            "PDF report downloaded successfully.",
            "success"
        );

    }


    catch (error) {

        console.error(
            "❌ PDF generation failed:",
            error
        );


        alert(

            "Unable to generate the PDF report.\n\n" +

            error.message

        );

    }


    finally {

        if (reportButton) {

            reportButton.disabled =
                false;

            reportButton.innerText =
                "📄 Download PDF Report";

        }

    }

}


/* =========================================================
   LOAD JSPDF
   ========================================================= */

function loadJsPDF() {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const existing =
                document.querySelector(
                    'script[src*="jspdf"]'
                );


            if (existing) {

                if (
                    typeof window.jspdf !==
                    "undefined"
                ) {

                    resolve();

                    return;

                }


                existing.addEventListener(
                    "load",
                    resolve
                );


                existing.addEventListener(
                    "error",
                    reject
                );


                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =

                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


            script.onload =
                function () {

                    console.log(
                        "✅ jsPDF loaded."
                    );

                    resolve();

                };


            script.onerror =
                function () {

                    reject(
                        new Error(
                            "jsPDF could not be loaded."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* =========================================================
   FILE TO DATA URL
   ========================================================= */

function convertFileToDataURL(
    file
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        reader.error
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(
    bytes
) {

    if (
        bytes === 0
    ) {

        return "0 Bytes";

    }


    const units = [

        "Bytes",

        "KB",

        "MB",

        "GB"

    ];


    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (

        parseFloat(

            (
                bytes /
                Math.pow(
                    1024,
                    i
                )

            ).toFixed(2)

        ) +

        " " +

        units[i]

    );

}



function showNotification(
    message,
    type = "success"
) {

    const notificationToggle =
        getElement(
            "notificationToggle"
        );


    if (
        notificationToggle &&
        !notificationToggle.checked
    ) {

        return;

    }


    let notification =
        getElement(
            "aiNotification"
        );


    if (!notification) {

        notification =
            document.createElement(
                "div"
            );


        notification.id =
            "aiNotification";


        notification.style.position =
            "fixed";


        notification.style.right =
            "25px";


        notification.style.bottom =
            "25px";


        notification.style.zIndex =
            "99999";


        notification.style.padding =
            "15px 20px";


        notification.style.borderRadius =
            "12px";


        notification.style.background =
            "#162235";


        notification.style.color =
            "#ffffff";


        notification.style.boxShadow =
            "0 10px 30px rgba(0,0,0,0.3)";


        notification.style.maxWidth =
            "350px";


        document.body.appendChild(
            notification
        );

    }


    notification.innerText =
        message;


    notification.style.display =
        "block";


    if (
        type === "error"
    ) {

        notification.style.borderLeft =
            "4px solid #ff4d6d";

    }

    else {

        notification.style.borderLeft =
            "4px solid #18c7ff";

    }


    clearTimeout(
        notification._timeout
    );


    notification._timeout =
        setTimeout(
            function () {

                notification.style.display =
                    "none";

            },
            4000
        );

}



function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



window.predict =
    predict;


window.speakPrediction =
    speakPrediction;


window.stopVoice =
    stopVoice;


window.clearHistory =
    clearHistory;


window.downloadPDFReport =
    downloadPDFReport;


window.toggleDarkMode =
    function () {

        const toggle =
            getElement(
                "darkModeToggle"
            );


        if (toggle) {

            toggle.checked =
                !toggle.checked;


            applyDarkMode(
                toggle.checked
            );

        }

    };


console.log(
    "🧠 Brain Tumor AI - upgraded script.js loaded."
);