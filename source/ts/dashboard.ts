
startUpDashboard();

// Start up dashboard
function startUpDashboard(): void {
    $(document).ready(startUpFunctions);
}

// Start up dashboard functions
function startUpFunctions(): void {
    setTimeout(loadQuestions, 1000);
    setTimeout(disableFormElements, 1500);
    setTimeout(loadVariables, 2000);
}

// Load query variables
function loadVariables(): void {
    // @ts-ignore
    const localVars = dashboardData;

    $('#name').val(localVars.name);
    $('#dob').val(localVars.dob);
    $('#age').val(localVars.age);
    $('#gender').val(localVars.gender);
    $('#version').val(localVars.version);

    const answers: Array<string> = localVars.answers.toString().split(',');

    const formLength: number = getQuestionQuantity();
    for (let question: number = 1; question < formLength; ++question) {
        let questionName: string = `Q${question}`;
        setRadioValue(questionName, answers[question - 1]);
    }

    $('#submission-loading').addClass('hidden');
}

// Set answer radio value
function setRadioValue(questionName, questionValue): void {
    const questionContainer: string = "d-questions";
    const questionNameSelector: string = `[name="${questionName}"]`;
    const questionAnswerElements: NodeListOf<Element> | undefined = document.getElementById(questionContainer)?.querySelectorAll(questionNameSelector);

    questionAnswerElements?.forEach(function (element): void {
        // @ts-ignore
        const radioValue: any = element.value;
        if (radioValue === questionValue)
            // @ts-ignore
            element.checked = true;
    });
}

// Toggle questions
function toggleQuestions(): void {
    $('#q-questions-container').toggleClass('hidden');
}

// Toggle secondary scoring matrix
function toggleSecondScore(): void {
    $('#d-second-score-container').toggleClass('hidden');
}