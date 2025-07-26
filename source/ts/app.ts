
injectContents();
//autoDoTest();

// Get the button:
let mybutton: HTMLElement | null = document.getElementById("button-goToTop");

// When the user scrolls down 100px from the top of the document, show the button
window.onscroll = function (): void { scrollFunction() };

// Smooth scroll to element id
function scrollSmoothTo(elementId): void {
    var element: HTMLElement | null = document.getElementById(elementId);
    element?.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
    });
}

// Inject contents inside theirs divs
function injectContents(): void {
    $("div[contents]").each(function (): void {
        $(this).load(`${$(this).attr('contents')}.html`);
    });
}

// Trigger on date of birth input
function onDobInput(element): void {
    const dobValue: any = element.value;
    const dobDate: number = +new Date(dobValue);
    const currentDate: number = Date.now();
    const fixedYearSeconds: number = 31557600000;
    const age: number = ~~((currentDate - dobDate) / fixedYearSeconds);
    $("#age").val(age);
}

// Trigger on age input
function onAgeInput(element): void {
    if (element.value.length > element.maxLength)
        element.value = element.value.slice(0, element.maxLength);
}

// Scroll Function
function scrollFunction(): void {
    if ((document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) && $("#q-submission-modal").hasClass("hidden")) {
        $("#button-goToTop").css("display", "block");
    } else {
        $("#button-goToTop").css("display", "none");
    }
}

// Form submission
// #region

// Submit confirmation modal
function submitConfirmation(): void {
    makeAnswerMatrix();
    let unansweredItemCount: number = countUnansweredItems();
    let unansweredItemLimit: number = 29;
    if (unansweredItemCount > unansweredItemLimit) {
        $("#submission-confirmation-alert-unanswered-items").text(unansweredItemCount.toString());
        $("#q-submission-model-alert").removeClass("hidden");
    } else {
        $("#q-submission-modal").removeClass("hidden");
    }
    $("#button-goToTop").css("display", "none");
}

// Cancel form submission
function cancelSubmission(): void {
    $("#q-submission-modal").addClass("hidden");
    $("#button-goToTop").css("display", "block");
}

// Cancel form submission alert
function cancelSubmissionAlert(): void {
    $("#q-submission-model-alert").addClass("hidden");
    $("#button-goToTop").css("display", "block");
}

// Confirm form submission
function confirmSubmission(): void {
    $("#q-submission-loading").removeClass("hidden");
    $(`[name="confirmSubmission"]`).prop("disabled", true);

    const type: string = "POST";
    const url: string = "/submission";
    const data: object = getFormData();
    const dataType: string = "json";

    $.ajax({
        type,
        url,
        data,
        dataType,
        success: function (response): void {

            const responseMessage: string = response.message;
            const successMessage: string = "Submitted with success";
            const successUrl: string = '/submitted';
            if (responseMessage === successMessage) {
                window.onbeforeunload = null;
                window.location.replace(successUrl);
            } else {
                submitConfirmationRetry();
            }
        },
        // @ts-ignore
        error: function (jqXHR, textStatus, errorThrown): void {
            submitConfirmationRetry();
        }
    });
}

// Retry submission
function submitConfirmationRetry(): void {
    setTimeout(function (): void {
        $(`[name="confirmSubmission"]`).removeClass("bg-green-600");
        $(`[name="confirmSubmission"]`).addClass("bg-red-600");
        $(`[name="confirmSubmission"]`).removeClass("hover:bg-green-500");
        $(`[name="confirmSubmission"]`).addClass("hover:bg-red-500");
        $(`[name="confirmSubmission"]`).prop("disabled", false);
        $(`[name="confirmSubmission"]`).text("Submeter Novamente");
        $("#q-submission-failure").removeClass("hidden");
        $("#q-submission-loading").addClass("hidden");
    }, 3000);
    setTimeout(function (): void {
        $("#q-submission-failure").addClass("hidden");
    }, 9500)
}

// #endregion

// 
function getFormData(): object {
    const formData: object = {
        name: $("#name").val(),
        dob: $("#dob").val(),
        age: $("#age").val(),
        gender: $("#gender").val(),
        version: $("#version").val(),
        answers: globalThis.ans.flat(Infinity).join().toString()
    };
    return formData;
}

// Count unanswered items
function countUnansweredItems(): number {
    var unansweredItemsCount: number = 0;
    const answersTotal: number = globalThis.ans.length;
    var unansweredValue: string = "?";
    for (let question: number = 0; question < answersTotal; ++question) {
        if (globalThis.ans[question] === unansweredValue)
            unansweredItemsCount++;
    }
    return unansweredItemsCount;
}

// Create answer matrix
function makeAnswerMatrix(): void {
    let formLength: number = getQuestionQuantity();
    globalThis.ans = [];
    for (let question: number = 1; question < formLength; ++question) {
        let questionName: string = `Q${question}`;
        let questionValue: string = getRadioValue(questionName);
        globalThis.ans.push(questionValue);
    }
}

// Reset answer matrix
function resetAnswerMatrix(): void {
    globalThis.ans = [];
}

// Get question name radio value
function getRadioValue(questionName: string): string {
    const questionContainer: string = "q-questions";
    const questionNameSelector: string = `[name="${questionName}"]`;
    const questionAnswerElements: NodeListOf<Element> | undefined = document.getElementById(questionContainer)?.querySelectorAll(questionNameSelector);
    var questionValue: string = "?";

    if (typeof questionAnswerElements === undefined)
        return "?";
    if (questionAnswerElements?.length === 0)
        return "?";

    questionAnswerElements?.forEach(function (element): void {
        // @ts-ignore
        const isChecked: boolean = element.checked;
        if (isChecked) {
            // @ts-ignore
            const answer: string = element.value;
            questionValue = answer;
        }
    });

    return questionValue;
}

// Get question length
function getQuestionQuantity(): number {
    let isLongForm: Boolean = globalThis.longform;
    let longFormLength: number = globalThis.questions.length;
    console.log()
    let shortFormLength: number = 371;
    if (isLongForm)
        return longFormLength;
    else
        return shortFormLength;
}

// When the user clicks on the button, scroll to the top of the document
function topFunction(): void {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// Go to buttons
// #region

// Go to identification
function goToIdentification(): void {
    if (globalThis.loaded.identification === false) {
        globalThis.loaded.identification = true;
        $("#q-identification").load('./q-identification.html', function (): void {
            setTimeout(function (): void {
                scrollSmoothTo("q-identification");
            }, 250);
        });
    } else {
        scrollSmoothTo("q-identification");
    }
}

// Go to questions after identification
function goToQuestions(): void {
    if (globalThis.loaded.questions === false) {
        let fieldsFilled: Boolean = true;
        //@ts-ignore
        document.getElementById("q-identification").querySelectorAll("[required]").forEach(function (field): void {
            field.classList.replace("ring-red-500", "ring-gray-300");
            // @ts-ignore
            if (!field.value) {
                field.classList.replace("ring-gray-300", "ring-red-500");

                fieldsFilled = false;
                return;
            }
            if (!fieldsFilled) return;
        });
        if (!fieldsFilled) {
            $("#q-identification-alert").removeClass("invisible");
            return;
        }
        globalThis.loaded.questions = true;
        $("#q-identification-alert").addClass("invisible");
        // @ts-ignore
        document.getElementById("q-identification").querySelectorAll("[required]").forEach(function (field): void {
            field.classList.replace("ring-red-500", "ring-gray-300");
        });
        disableFormElements();
        let oldValue: string = $("#button-goToQuestions").text();
        $("#button-goToQuestions").text("A carregar...");
        $("#q-questions").load('./q-questions.html', function (): void {
            $("#q-submission").load('./q-submission.html', function (): void {
                setTimeout(function (): void {
                    var longform: Boolean = $("#version").val() === "long" ? true : false;
                    doc_write_all_questions(longform);
                    setTimeout(function (): void {
                        $("#button-goToQuestions").text(oldValue);
                        $("#q-questions").removeClass("hidden");
                        $("#q-submission").removeClass("hidden");
                        scrollSmoothTo("q-questions");

                    }, 250)
                }, 1250);
            })
        });
    } else {
        scrollSmoothTo("q-questions");
    }
}

// Load all questions
function loadQuestions() {
    var longform: Boolean = $("#version").val() === "long" ? true : false;
    doc_write_all_questions(longform);
}

// #endregion

// Disable identification form elements from further changes
function disableFormElements(): void {
    $("#name").prop("disabled", true);
    $("#dob").prop("disabled", true);
    $("#age").prop("disabled", true);
    $("#gender").prop("disabled", true);
    $("#version").prop("disabled", true);
}

// Question app write
// #region

// Write a single question to the HTML page
function doc_write_question(name, index, text): void {
    var questionContent: string = `
    <div class="flex flex-row md:flex-row inline h-6 py-5 items-center">
        <div class="flex-none">
            <input type="radio" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" name="${name}" value="?"><b class="px-1 text-lg">SR</b></input>
            <input type="radio" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" name="${name}" value="T"><b class="px-1 text-lg">V</b></input>
            <input type="radio" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" name="${name}" value="F"><b class="px-1 text-lg">F</b></input>
        </div>
        <div class="shrink">
            <div class="px-6 text-lg"><b>${index}.</b> ${text}</div>
        </div>
    </div>
    <br />`;
    $('#q-questions-container').append(questionContent);
}

// Write all question radio buttons and text to the HTML page - called from the HTML
function doc_write_all_questions(longform): void {
    var questionsLength: number = questions.length;
    if (longform === false)
        questionsLength = 371;
    for (var question: number = 1; question < questionsLength; ++question) {
        doc_write_question("Q" + question, question, questions[question]);
    }
}

// #endregion

// Debug, test automation
// #region

// Auto do the whole test
function autoDoTest(): void {
    setTimeout(function (): void {
        $("#button-goToIdentification").click();
    }, 250);

    setTimeout(function (): void {
        autoFillIdentification();
    }, 1500);

    setTimeout(function (): void {
        $("#button-goToQuestions").click();
    }, 2500);

    setTimeout(function (): void {
        autoAnswerEverything();
    }, 5500);

    setTimeout(function (): void {
        autoMakeUnanswered();
    }, 6500);

    setTimeout(function (): void {
        scrollSmoothTo("q-submission");
    }, 7000);

    setTimeout(function (): void {
        submitConfirmation()
    }, 7500);

    /* setTimeout(function (): void {
         confirmSubmission()
     }, 8000);*/
}


// Auto answer all the items
function autoAnswerEverything(): void {
    const formLength: number = getQuestionQuantity();
    for (let question: number = 1; question < formLength; ++question) {
        let questionName: string = `Q${question}`;
        setRandomRadioValue(questionName);
    }
}

// Make lst 30 questions unanswered
function autoMakeUnanswered(): void {
    const formLength: number = getQuestionQuantity();
    const startingQuestion: number = formLength - 30;
    for (let question: number = startingQuestion; question < formLength; ++question) {
        let questionName: string = `Q${question}`;
        setNoAnswerRadioValue(questionName);
    }
}

// Auto fill identification
function autoFillIdentification(): void {
    $("#name").val("Example name");
    $("#dob").val("1990-09-02");
    onDobInput(document.getElementById("dob"));
    $("#gender").val("test");
}

// Set a random radio value
function setRandomRadioValue(questionName): void {
    const questionContainer: string = "q-questions";
    const questionNameSelector: string = `[name="${questionName}"]`;
    const questionAnswerElements: NodeListOf<Element> | undefined = document.getElementById(questionContainer)?.querySelectorAll(questionNameSelector);
    const questionValue: String = randomBoolean() ? "T" : "F";

    questionAnswerElements?.forEach(function (element) {
        // @ts-ignore
        const radioValue: any = element.value;
        if (radioValue === questionValue)
            // @ts-ignore
            element.checked = true;
    });
}

// Set a no answer radio value
function setNoAnswerRadioValue(questionName): void {
    const questionContainer: string = "q-questions";
    const questionNameSelector: string = `[name="${questionName}"]`;
    const questionAnswerElements: NodeListOf<Element> | undefined = document.getElementById(questionContainer)?.querySelectorAll(questionNameSelector);
    const questionValue = "?"

    questionAnswerElements?.forEach(function (element): void {
        // @ts-ignore
        const radioValue: any = element.value;
        if (radioValue === questionValue)
            // @ts-ignore
            element.checked = true;
    });
}

// Get a random boolean
function randomBoolean(): boolean {
    return Boolean(Math.random() < 0.5);
}

// #endregion 