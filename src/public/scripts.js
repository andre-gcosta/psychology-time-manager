const calendar = document.getElementById('calendar');
const calendarContainer = document.querySelector('.calendar-container');
const calendarTitle = document.getElementById('calendar-title');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const monthViewButton = document.getElementById('month-view');
const weekViewButton = document.getElementById('week-view');
const dayViewButton = document.getElementById('day-view');
const addEventButton = document.getElementById('add-event');
const eventModal = document.getElementById('event-modal');
const eventModalView = document.getElementById('event-modal-view');
const closeModalButton = document.getElementById('close-modal');
const saveEventButton = document.getElementById('save-event');
const closeModalViewButton = document.getElementById('close-modal-view');
const deleteEventViewButton = document.getElementById('delete-event-view')

const patientGeneralVisionSection = document.getElementById('patient-general-vision-section')
const addPatientModal = document.getElementById('addPatientModal')
const patientModal = document.getElementById('patient-modal')
const editButtonPatient = document.getElementById('edit-patient');
const saveButtonPatient = document.getElementById('save-patient');
const cancelButtonPatient = document.getElementById('cancel-edit');

const sessionsGeneralVisionSection = document.getElementById('sessions-general-vision-section')
const sessionSelect = document.getElementById('session-options');
const sessionContainer = document.getElementById('session-container');
const openSessionView = document.getElementById('open-session');
const createSessionView = document.getElementById('create-session');
const modifySessionView = document.getElementById('modify-session');
const listSessions = document.getElementById('list-sessions')

const generalVisionAnchor = document.getElementById('general-vision-anchor')
const sessionVisionAnchor = document.getElementById('session-vision-anchor')
const calendarVisionAnchor = document.getElementById('calendar-vision-anchor')
const eventCreateAnchor = document.getElementById('event-create-anchor')
const fastActionEvent = document.getElementById('fast-action-event')

let currentDate = new Date();
let currentView = 'month';
let selectedDate = null;

let events = [
    {
        "name": "Exemplo 1",
        "start": new Date("2024-10-01T03:00:00.000Z"),
        "end": new Date("2024-10-01T04:00:00.000Z"),
        "recurrence": "none",
        "duration": "60",
        "type": "Presencial",
        "color": "#c75252",
        "notes": "",
        "annotations": [],
        "medicalRecords": []
    },
]
let patients = [
    {
        "childAdolescent": false,
        "name": "Exemplo 1",
        "cpf": "000.000.000-00",
        "ddd": "55",
        "telefone": "(00) 00000-0000",
        "emergencyContacts": [
            {
                "name": "",
                "phone": ""
            }
        ],
        "email": "exemplo@email.com",
        "dob": "",
        "country": "",
        "gender": "",
        "profession": "",
        "healthPlan": "",
        "treatment": "",
        "medication": "",
        "quantity": "",
        "unit": "g",
        "events": [
            {
                "name": "Exemplo 1",
                "start": new Date("2024-10-01T03:00:00.000Z"),
                "end": new Date("2024-10-01T04:00:00.000Z"),
                "recurrence": "none",
                "duration": "60",
                "type": "Presencial",
                "color": "#c75252",
                "notes": "",
                "annotations": [],
                "medicalRecords": []
            },
        ],
        "documents": []
    }
];

let preventWriteDatabase = true;

async function getData() {
    try {
        const response = await fetch('http://localhost:3000/get-data')
        // .then(response => {
        //     if (response.status === 200) {
        //         return response.json()
        //     }
        // })
        // .then(data => {
        //     events = data.events
        //     patients = data.patients
        //     console.log(data);
        //     console.log(`Array1: ${JSON.stringify(data.events)}\nArray2: ${JSON.stringify(data.patients)}`);
        // })
        if (response.ok) {
            const data = await response.json();
            events = data.events
            patients = data.patients
            preventWriteDatabase = false;
            // console.log(data)
            // console.log((data.patients))
            // console.log(`Array1: ${JSON.stringify(data.events)}\nArray2: ${JSON.stringify(data.patients)}`)

            goHome()
            updateCalendar()
            displayPatients()
            displaySessions()
            
        } else {
            throw new Error('Request failed with status ' + response.status);
        }
    } catch(error) {
        console.error('Error:', error);
    }
}
getData()

generalVisionAnchor.addEventListener('click', () => { disableAllDisplays() ;patientGeneralVisionSection.style.display = 'flex'; modalPatientLoadSessions(patients.find((patient) => patient.name == patientModal.dataset.value)) }) // atualiza o modal do paciente depois de fazer anotação
sessionVisionAnchor.addEventListener('click', () => { disableAllDisplays() ;sessionsGeneralVisionSection.style.display = 'flex'; displaySessions(); sessionSelectDisplay('open-existing'); sessionSelect.value = 'open-existing' })
fastActionEvent.addEventListener('click', () => { disableAllDisplays() ;sessionsGeneralVisionSection.style.display = 'flex'; displaySessions(); sessionSelectDisplay('create-new'); sessionSelect.value = 'create-new' })

function disableAllDisplays() {
    patientGeneralVisionSection.style.display = 'none'
    sessionsGeneralVisionSection.style.display = 'none'
}
function goHome() {
    disableAllDisplays() ;patientGeneralVisionSection.style.display = 'flex'; modalPatientLoadSessions(patients.find((patient) => patient.name == patientModal.dataset.value)) // atualiza o modal do paciente depois de fazer anotação
}

function updateCalendar() {
    calendar.innerHTML = '';
    
    if (currentView === 'month') {
        calendarTitle.innerText = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        renderMonthView();
    } else if (currentView === 'week') {
        calendarTitle.innerText = currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        renderWeekView();
    } else if (currentView === 'day') {
        calendarTitle.innerText = currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        renderDayView();
    }
}

function renderMonthView() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    calendar.className = 'month-view';

    for (let i = 0; i < firstDay.getDay(); i++) {
        const cell = document.createElement('div');
        cell.className = 'cell-month';
        calendar.appendChild(cell);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const cell = document.createElement('div');
        cell.className = 'cell-month';
        cell.innerText = day;
        cell.onclick = () => openEventModal(new Date(year, month, day));
        calendar.appendChild(cell);
    

        // Render events for the current day
        const eventsForDay = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
        });

        // Sort events by start time
        eventsForDay.sort((a, b) => new Date(a.start) - new Date(b.start));

        // Create a panel for each event
        eventsForDay.forEach(event => {
            const eventPanel = document.createElement('div');
            eventPanel.className = 'event-panel';
            eventPanel.style.backgroundColor = event.color; // Set the background color
            eventPanel.id = new Date().getTime() //not more used
            eventPanel.onclick = (ev) => { openEventModalView(event, eventPanel.id); ev.stopPropagation(); } // Open modal with event details
            
            // Create a decorative pin
            const pin = document.createElement('div');
            pin.className = 'event-pin';
            pin.style.backgroundColor = "blue"//event.color; // Pin color
            eventPanel.appendChild(pin);
            
            // Add event name and time
            const startTime = new Date(event.start).getHours();
            eventPanel.innerText = `${event.name} (${startTime}:00)`;
            eventPanel.prepend(pin); // Add pin to the front

            // Append event panel to the calendar cell
            cell.appendChild(eventPanel);
        });
    }
}

function renderWeekView() {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    calendar.className = 'week-view';

    // Create day headers
    for (let i = 0; i < 7; i++) {
        if (i==0) {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'cell hour-header';
            dayHeader.style.height = '60px'
            calendar.appendChild(dayHeader);
        }
        const dayHeader = document.createElement('div');
        dayHeader.className = 'cell day-header';
        dayHeader.innerText = startOfWeek.toLocaleDateString('pt-BR') + '\n' + startOfWeek.toLocaleString('pt-BR', { weekday: 'long' });
        dayHeader.style.textAlign = 'center'
        dayHeader.style.alignContent = 'center'
        dayHeader.style.height = '60px'
        dayHeader.style.fontSize = '14px'
        dayHeader.dataset.column = i
        dayHeader.dataset.headerDay = startOfWeek.getDate();
        dayHeader.dataset.headerMonthAndYear = startOfWeek.getMonth()+1 +'/'+startOfWeek.getFullYear();
        calendar.appendChild(dayHeader);
        startOfWeek.setDate(startOfWeek.getDate() + 1);
    }

    for (let hour = 0; hour < 24; hour++) {
        if (true) {
            const hourCell = document.createElement('div');
            hourCell.className = 'cell hour-header';
            hourCell.innerText = `${hour}:00`;
            calendar.appendChild(hourCell);
        }
        for (let i = 0; i < 7; i++) {
            const hourCell = document.createElement('div');
            hourCell.className = 'cell';

            // Create a new date object for the current cell
            const cellDate = new Date(currentDate);
            cellDate.setDate(currentDate.getDate() - currentDate.getDay() + i);
            cellDate.setHours(hour, 0, 0, 0); // Set the time to the current hour

            // hourCell.innerText = `${hour}:00`;
            hourCell.dataset.day = document.querySelector(`[data-column="${i}"]`).dataset.headerDay
            hourCell.dataset.hour = hour
            // hourCell.onclick = () => openEventModal(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour -3));
            hourCell.onclick = () => openEventModal(cellDate); // Pass the cellDate to the modal
            calendar.appendChild(hourCell);
        }
    }

    renderEventsForWeek();
}

function renderEventsForWeek() {
    events.forEach(event => {
        datesForRender = []
        for (let i = 0; i < 7; i++) {
            datesForRender.push(document.querySelector(`[data-column="${i}"]`).dataset.headerDay + '/' + document.querySelector(`[data-column="${i}"]`).dataset.headerMonthAndYear)
        }
        // const headerStartDayData = document.querySelector(`[data-column="${0}"]`).dataset.headerDay
        // const headerEndDayData = document.querySelector(`[data-column="${6}"]`).dataset.headerDay
        // const headerStartMonthAndYearData = document.querySelector(`[data-column="${0}"]`).dataset.headerMonthAndYear
        // const headerEndMonthAndYearData = document.querySelector(`[data-column="${6}"]`).dataset.headerMonthAndYear

        // correction of string dates from db
        event.start = new Date(event.start)
        event.end = new Date(event.end)

        const eventStartDate = event.start.getDate() + '/' + (event.start.getMonth()+1) + '/' + event.start.getFullYear()
        const eventEndDate = event.end.getDate() + '/' + (event.end.getMonth()+1) + '/' + event.end.getFullYear()

        // console.log(datesForRender)
        // console.log(eventStartDate)
        // console.log(eventEndDate)
        // console.log(datesForRender.includes(eventStartDate))    
        if (
            (event.start && event.end) &&
            (datesForRender.includes(eventStartDate)) && (datesForRender.includes(eventEndDate))
        ) {

            if (event.start.getDate() > event.end.getDate()) {
                console.log('Error: Start date set after end date.')
            } else if (event.start.getDate() == event.end.getDate()) {
                // if event.start
                // console.log(event.start.getHours())
                // console.log(event.end.getHours())
                // console.log(event.start.getMinutes())
                // console.log(event.end.getMinutes())

                cellForEventStart = document.querySelector(`[data-day="${event.start.getDate()}"][data-hour="${event.start.getHours()}"]`)

                const eventDiv = document.createElement('div');
                eventDiv.className = 'event-panel-flexible';
                eventDiv.style.backgroundColor = event.color;
                eventDiv.onclick = (ev) => { openEventModalView(event, eventDiv.id); ev.stopPropagation(); } // Open modal with event details


                const baseHeight = 60
                let percentageDuration = 0
                percentageDuration = event.duration * (1/60)
                const additionalPixels = percentageDuration*2 - 4 - 10

                let percentageStartMinutes = 0
                percentageStartMinutes = event.start.getMinutes() * (1/60)
                // console.log(percentageStartMinutes)

                const rect = cellForEventStart.getBoundingClientRect();
                const rectPage = document.documentElement.getBoundingClientRect(); // added in 12/11/24 to resolve scroll page bug
                const scrollPage = window.pageYOffset || document.documentElement.scrollTop;
                const relativePostitionTopDifference = 159 //174//144 //152 // correction of top when switched calendar to relative position
                //const rectPatientContainer = patientGeneralVisionSection.getBoundingClientRect(); //eliminated in 12/11/24
                const rectCalendarContainer = calendarContainer.getBoundingClientRect();  // added in 12/11/24 to resolve calendar css break bug

                const scrollCalendar = calendarContainer.scrollTop;
                const baseTop = rect.top + scrollPage + scrollCalendar + rectPage.top - rectCalendarContainer.y - relativePostitionTopDifference // - rectPatientContainer.top
                // const baseTop = rect.top + scrollPage + scrollCalendar - relativePostitionTopDifference - rectPatientContainer.top
                const width = rect.width
                eventDiv.style.top = `${(baseTop + (baseHeight * percentageStartMinutes))}px`
                eventDiv.dataset.setTop = baseTop + (baseHeight * percentageStartMinutes)                
                eventDiv.style.height = `${(baseHeight * percentageDuration) + additionalPixels}px`//`${height}%`;
                eventDiv.style.width = '85px'//`${width}px`
                eventDiv.innerText = `${event.start.getHours()}:${String(event.start.getMinutes()).padStart(2, '0')} - ${event.end.getHours()}:${String(event.end.getMinutes()).padStart(2, '0')}\n${event.name}`;
                cellForEventStart.appendChild(eventDiv)
                eventDiv.style.alignItems = 'start'
                eventDiv.style.textAlign = 'start'

                // Create a resizable bottom border // not implemented
                const resizer = document.createElement('div');
                // resizer.className = 'resizer';
                resizer.style.width = '100%';
                resizer.style.height = '10px';
                resizer.style.backgroundColor = 'transparent';
                // resizer.style.cursor = 'ns-resize';
                eventDiv.appendChild(resizer);

                cellForEventStart.appendChild(eventDiv)
                
                // Add resizing functionality
                //resizer.addEventListener('mousedown', initResize);


            } else {
                //console.log('Um evento de um dia para o outro ainda não é suportado automaticamente! Coloque as horas do evento em cada dia manualmente.')
            }
        }
        // } else {
        //     console.log('Error: Event with unavailable start or end date.')
        // }
    });
}

function renderDayView() {
    const renderDay = new Date(currentDate)
    calendar.className = 'day-view'
    
    // Create headers
    for (let i = 0; i < 1; i++) {
        if (i==0) {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'cell hour-header';
            dayHeader.style.height = '30px'
            calendar.appendChild(dayHeader);
        }
        const dayHeader = document.createElement('div');
        dayHeader.className = 'cell day-header';
        dayHeader.innerText = renderDay.toLocaleString('pt-BR', { weekday: 'long' });
        dayHeader.style.textAlign = 'center'
        dayHeader.style.alignContent = 'center'
        dayHeader.style.height = '30px'
        dayHeader.dataset.column = i
        dayHeader.dataset.headerDay = renderDay.getDate();
        dayHeader.dataset.headerMonthAndYear = renderDay.getMonth()+1 +'/'+renderDay.getFullYear();
        calendar.appendChild(dayHeader);
        renderDay.setDate(renderDay.getDate());
    }

    for (let hour = 0; hour < 24; hour++) {
        if (true) {
            const hourCell = document.createElement('div');
            hourCell.className = 'cell';
            hourCell.innerText = `${hour}:00`;
            hourCell.onclick = () => openEventModal(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour));
            calendar.appendChild(hourCell);
        }
        for (let i = 0; i < 1; i++) {
            const hourCell = document.createElement('div');
            hourCell.className = 'cell';

            // Create a new date object for the current cell
            const cellDate = new Date(currentDate);
            cellDate.setDate(renderDay.getDate());
            cellDate.setHours(hour, 0, 0, 0); // Set the time to the current hour

            // hourCell.innerText = `${hour}:00`;
            hourCell.dataset.day = document.querySelector(`[data-column="${i}"]`).dataset.headerDay
            hourCell.dataset.hour = hour
            // hourCell.onclick = () => openEventModal(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour -3));
            hourCell.onclick = () => openEventModal(cellDate); // Pass the cellDate to the modal
            calendar.appendChild(hourCell);
        }
    }

    renderEventsForDay();
}

function renderEventsForDay() {
    events.forEach(event => {
        dayForRender = document.querySelector(`[data-column="${0}"]`).dataset.headerDay + '/' + document.querySelector(`[data-column="${0}"]`).dataset.headerMonthAndYear
        
        // correction of string dates from db
        event.start = new Date(event.start)
        event.end = new Date(event.end)
        
        const eventStartDate = event.start.getDate() + '/' + (event.start.getMonth()+1) + '/' + event.start.getFullYear()
        const eventEndDate = event.end.getDate() + '/' + (event.end.getMonth()+1) + '/' + event.end.getFullYear()
    if (
        (event.start && event.end) &&
        ((dayForRender === eventStartDate) || (dayForRender === eventEndDate))
    ) {
        if (event.start.getDate() > event.end.getDate()) {
            console.log('Error: Start date set after end date')
        } else if (event.start.getDate() == event.end.getDate()) {
            cellForEventStart = document.querySelector(`[data-day="${event.start.getDate()}"][data-hour="${event.start.getHours()}"]`)
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-panel-flexible-day';
            eventDiv.style.backgroundColor = event.color;
            eventDiv.onclick = (ev) => { openEventModalView(event, eventDiv.id); ev.stopPropagation(); } // Open modal with event details

            const baseHeight = 60
            let percentageDuration = 0
            percentageDuration = event.duration * (1/60)
            const additionalPixels = percentageDuration*2 - 4 - 10

            let percentageStartMinutes = 0
            percentageStartMinutes = event.start.getMinutes() * (1/60)

            const rect = cellForEventStart.getBoundingClientRect();
            const rectPage = document.documentElement.getBoundingClientRect(); // added in 12/11/24 to resolve scroll page bug
            const scrollPage = window.pageYOffset || document.documentElement.scrollTop;
            const relativePostitionTopDifference = 159 //174//144  // modified in 12/11/24
            //const rectPatientContainer = patientGeneralVisionSection.getBoundingClientRect(); //eliminated in 12/11/24
            const rectCalendarContainer = calendarContainer.getBoundingClientRect();  // added in 12/11/24 to resolve calendar css break bug

            const scrollCalendar = calendarContainer.scrollTop;
            const baseTop = rect.top + scrollPage + scrollCalendar + rectPage.top - rectCalendarContainer.y - relativePostitionTopDifference // - rectPatientContainer.top
            const width = rect.width
            eventDiv.style.top = `${(baseTop + (baseHeight * percentageStartMinutes))}px`
            eventDiv.dataset.setTop = baseTop + (baseHeight * percentageStartMinutes)
            eventDiv.style.height = `${(baseHeight * percentageDuration) + additionalPixels}px`//`${height}%`;
            eventDiv.style.width = '715px'//'732px'//`${width}px`
            eventDiv.innerText = `${event.start.getHours()}:${String(event.start.getMinutes()).padStart(2, '0')} - ${event.end.getHours()}:${String(event.end.getMinutes()).padStart(2, '0')}\n${event.name}`;
            cellForEventStart.appendChild(eventDiv)
            eventDiv.style.alignItems = 'start'
            eventDiv.style.textAlign = 'start'
        } else {
            // console.log('Um evento de um dia para o outro ainda não é suportado automaticamente! Coloque as horas do evento em cada dia manualmente.')
        }
    }
    });
}

// Add the scroll event listener to the calendar container
calendarContainer.addEventListener('scroll', updateCalendar);
window.addEventListener('resize', updateCalendar);


// let isResizing = false;
// let currentEventDiv = null;

// function initResize(e) {
//     isResizing = true;
//     currentEventDiv = e.target.parentNode; // Get the parent event div
//     window.addEventListener('mousemove', doDrag);
//     window.addEventListener('mouseup', stopResize);
// }
// function doDrag(e) {
//     if (isResizing) {
//         const newHeight = e.clientY - currentEventDiv.getBoundingClientRect().top; // Calculate new height
//         if (newHeight > 0) { // Prevent negative height
//             currentEventDiv.style.height = `${newHeight}px`;
//             updateEventDuration(currentEventDiv); // Update the event duration
//         }
//     }
// }
// function stopResize() {
//     isResizing = false;
//     window.removeEventListener('mousemove', doDrag);
//     window.removeEventListener('mouseup', stopResize);
// }
// function updateEventDuration(eventDiv) {
//     // Calculate the new duration based on the new height of the div
//     const baseHeight = 60; // Base height used earlier
//     const newHeight = parseInt(eventDiv.style.height);
//     const newDuration = (newHeight / baseHeight)*60; // Calculate new duration in minutes //hours
//     console.log(newDuration)

//     // Update the associated event's duration
//     const event = events.find(e => e.name === eventDiv.innerText.split('\n')[1]); // Find event by name
//     if (event) {
//         console.log(event.duration)
//         event.duration = newDuration
//         newEndDate = event.end.getMinutes() + newDuration
//         console.log(event.end.getMinutes())
//         // const newEnd = new Date(event.start);
//         // newEnd.setHours(newEnd.getHours() + newDuration); // Update end time
//         // event.end = newEnd; // Update the event object
//     }
// }

function openEventModal(date) {
    selectedDate = date;
    const adjustedStartDate = new Date(date);
    adjustedStartDate.setHours(adjustedStartDate.getHours() - 3); // Subtract 3 hours for display
    const adjustedEndDate = new Date(adjustedStartDate); // Create a copy for the end date
    adjustedEndDate.setHours(adjustedStartDate.getHours() + 1);

    // date.setHours(date.getHours()); //brazilia hour correction
    document.getElementById('start-date').value = adjustedStartDate.toISOString().slice(0, 16);//date.toISOString().slice(0, 16);
    document.getElementById('end-date').value = adjustedEndDate.toISOString().slice(0, 16);//date.toISOString().slice(0, 16);
    // Set initial end date based on the current duration or to the same as start if duration is 0
    // updateEndDateFromDuration();
    document.getElementById('duration').value = 60; // Reset duration
    // document.getElementById('event-color').value = "#c75252"
    eventModal.style.display = 'flex';
}
function colorWithEventTypeDefault() {
    if (document.getElementById('event-type').value == "Presencial") {
        document.getElementById('event-color').value = "#c75252"
    } else {
        document.getElementById('event-color').value = "#5b53c7"
    }
}

function openEventModalView(event, id) {
    // If it's a new event, set defaults
    
    if (!event) {
        selectedDate = new Date();
        eventModalView.querySelector('#event-name-display').value = '';
        eventModalView.querySelector('#start-date-display').value = '';
        eventModalView.querySelector('#end-date-display').value = '';
        eventModalView.querySelector('#event-type-display').checked = false;
        eventModalView.querySelector('#event-notes-display').value = '';
    } else {
        // Populate the modal with event details
        eventModalView.querySelector('#event-name-display').innerText = event.name;

        // correction of string dates from db
        event.start = new Date(event.start)
        event.end = new Date(event.end)

        eventModalView.querySelector('#start-date-display').innerText = formatDate(event.start);
        eventModalView.querySelector('#end-date-display').innerText = formatDate(event.end);
        eventModalView.querySelector('#event-type-display').innerText = event.type == 'Presencial' ? 'Sim' : 'Não';
        eventModalView.querySelector('#event-notes-display').innerText = event.notes;
        selectedEvent = event; // Keep track of the selected event for deletion
    }

    eventModalView.style.display = 'flex';
}
function formatDate(date) {
    
    // Define month names in Portuguese
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Extract components
    const day = String(date.getDate()).padStart(2, '0'); // Day
    const month = months[date.getMonth()]; // Month name
    const year = date.getFullYear(); // Year
    const hours = String(date.getHours()).padStart(2, '0'); // Hours
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes

    // Format the date string
    return `${day} de ${month} de ${year} às ${hours}:${minutes}`;
}

document.getElementById('start-date').addEventListener('input', updateDurationAndEndDate);
document.getElementById('end-date').addEventListener('input', updateDuration);
document.getElementById('duration').addEventListener('input', updateEndDateFromDuration);
document.getElementById('event-type').addEventListener('input', colorWithEventTypeDefault);

function updateDurationAndEndDate() {
    const start = new Date(document.getElementById('start-date').value);
    const duration = parseInt(document.getElementById('duration').value) || 0;

    if (start) {
        const newEnd = new Date(start.getTime() - 10800000 + duration * 60000); // Calculate new end date based on duration //10800000 is the utc correction
        document.getElementById('end-date').value = newEnd.toISOString().slice(0, 16);
    }
}

function updateDuration() {
    const start = new Date(document.getElementById('start-date').value);
    const end = new Date(document.getElementById('end-date').value);
    const duration = document.getElementById('duration');

    if (start && end) {
        const calculatedDuration = Math.floor((end - start) / (1000 * 60)); // Duration in minutes
        duration.value = Math.max(calculatedDuration, 0); // Ensure duration is not negative
    }
}

function updateEndDateFromDuration() {
    const start = new Date(document.getElementById('start-date').value);
    const duration = parseInt(document.getElementById('duration').value) || 0;

    if (start) {
        const newEnd = new Date(start); // Create a new date object based on start
        newEnd.setMinutes(start.getMinutes() + duration - 180); // Correctly add duration in minutes // -3h utc brazilia
        document.getElementById('end-date').value = newEnd.toISOString().slice(0, 16);
    }
}


addEventButton.addEventListener('click', (event) => {
    const date = new Date();
    openEventModal(date);
});

closeModalButton.addEventListener('click', () => {
    eventModal.style.display = 'none';
});

eventModal.addEventListener('click', (event) => {
    if (event.target === eventModal) { // Check if the click is on the modal background
        eventModal.style.display = 'none';
        selectedEvent = null; // Clear selected event
    }
});
eventModalView.addEventListener('click', (event) => {
    if (event.target === eventModalView) { // Check if the click is on the modal background
        eventModalView.style.display = 'none';
        selectedEvent = null; // Clear selected event
    }
});

deleteEventViewButton.addEventListener('click', () => {
    if (selectedEvent) {
        if (confirm(`Você deseja excluir a consulta de ${selectedEvent.name} em ${formatDate(selectedEvent.start)}?`)) {
            events = events.filter(event => event !== selectedEvent); // Remove the selected event
            
            const filteredPatient = patients.filter(patient => 
                patient.name === selectedEvent.name
            )
            if (filteredPatient.length === 0) {
                alert('Erro: paciente não encontrado')
                eventModal.style.display = 'none'; // Close the modal
                updateCalendar();
                return
            }
            const patient = filteredPatient[0]
            patient.events = patient.events.filter(event => event != selectedEvent)

            updateDatabase();

            eventModalView.style.display = 'none'; // Close the modal
            updateCalendar(); // Refresh the calendar
        }
    }
});

closeModalViewButton.addEventListener('click', () => {
    eventModalView.style.display = 'none';
    selectedEvent = null
})
const eventNameInput = document.getElementById('event-name');
const patientSuggestions = document.getElementById('patient-suggestions');

eventNameInput.addEventListener('input', () => {
    const searchTerm = eventNameInput.value.toLowerCase()
    if (!searchTerm) {
        patientSuggestions.style.display = 'none';
        return;
    }
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.cpf.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm)
    );

    // Clear previous suggestions
    patientSuggestions.innerHTML = '';

    // Display filtered patients
    filteredPatients.forEach(patient => {
        const li = document.createElement('li');
        li.textContent = patient.name;
        li.addEventListener('click', () => {
            // Populate the input with the selected patient name
            eventNameInput.value = patient.name;
            patientSuggestions.style.display = 'none'; // Hide suggestions
        });
        patientSuggestions.appendChild(li);
    });

    // Show suggestions if there are results
    patientSuggestions.style.display = filteredPatients.length ? 'block' : 'none';
})
// Optionally, close the suggestion list when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('#event-name')) {
        patientSuggestions.style.display = 'none';
    }
});

saveEventButton.addEventListener('click', () => {
    // Here you would save the event data (e.g., to a database or an array)
    const name = document.getElementById('event-name').value;
    const start = new Date(document.getElementById('start-date').value);
    const end = new Date(document.getElementById('end-date').value);
    const recurrence = document.getElementById('recurrence').value;
    const duration = document.getElementById('duration').value;
    const type = document.getElementById('event-type').value;
    const color = document.getElementById('event-color').value;
    const notes = document.getElementById('notes').value;

    const annotations = []
    const medicalRecords = []

    const event = {
        name,
        start,
        end,
        recurrence,
        duration,
        type,
        color,
        notes,
        annotations,
        medicalRecords,
    };
    
    const filteredPatient = patients.filter(patient => 
        patient.name === name
    )
    if (filteredPatient.length === 0) {
        alert('Erro: paciente não encontrado')
        eventModal.style.display = 'none'; // Close the modal
        updateCalendar();
        return
    }
    const patient = filteredPatient[0]
    patient.events.push(event)
    // Store the event in the events array
    events.push(event);

    // Handle recurrence
    if (recurrence !== "none") {
        const weeks = parseInt(recurrence);
        for (let i = 1; i <= weeks; i++) {
            const newStart = new Date(start);
            const newEnd = new Date(end);
            newStart.setDate(newStart.getDate() + i * 7); // Add weeks
            newEnd.setDate(newEnd.getDate() + i * 7); // Adjust end date

            // Create a new event object for the recurrence
            const recurringEvent = {
                name,
                start: newStart,
                end: newEnd,
                recurrence: "none", // Set recurrence to none for individual events
                duration,
                type,
                color,
                notes,
                annotations,
                medicalRecords,
            };

            // Store the recurring event in the events array
            events.push(recurringEvent);
            patient.events.push(recurringEvent)
        }
    }

    updateDatabase();

    eventModal.style.display = 'none'; // Close the modal
    updateCalendar();
});

prevButton.addEventListener('click', () => {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
    } else if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    updateCalendar();
});

nextButton.addEventListener('click', () => {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
    } else if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    updateCalendar();
});

monthViewButton.addEventListener('click', () => {
    currentView = 'month';
    updateCalendar();
});

weekViewButton.addEventListener('click', () => {
    currentView = 'week';
    updateCalendar();
});

dayViewButton.addEventListener('click', () => {
    currentView = 'day';
    updateCalendar();
});

// Initialize calendar
updateCalendar();


document.getElementById('openModalAddPatient').onclick = function() {
    document.getElementById('addPatientModal').style.display = 'block';
}

document.getElementById('closeModalAddPatient').onclick = function() {
    document.getElementById('addPatientModal').style.display = 'none';
}

addPatientModal.addEventListener('click', (event) => {
    if (event.target === addPatientModal) { // Check if the click is on the modal background
        addPatientModal.style.display = 'none';
        selectedEvent = null; // Clear selected event
    }
});

// Toggle fields based on Cadastro Rápido
document.getElementById('quickRegister').onchange = function() {
    const completeFields = document.getElementById('completeFields');
    if (this.checked) {
        completeFields.style.display = 'none';
    } else {
        completeFields.style.display = 'block';
    }
}

// Handle form submission
document.getElementById('patientForm').onsubmit = function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    const patient = {
        childAdolescent: document.querySelector('input[name="childAdolescent"]').checked,
        name: document.getElementById('name').value,
        cpf: document.getElementById('cpf').value,
        ddd: document.getElementById('ddd').value,
        telefone: document.getElementById('telefone').value,
        emergencyContacts: [],
        email: document.getElementById('email').value,
        dob: document.getElementById('dob').value,
        country: document.getElementById('country').value,
        gender: document.getElementById('gender').value,
        profession: document.getElementById('profession').value,
        healthPlan: document.getElementById('healthPlan').value,
        treatment: document.getElementById('treatment').value,
        medication: document.getElementById('medication').value,
        quantity: document.getElementById('quantity').value,
        unit: document.getElementById('unit').value,
        events: [],
        documents: [],
    };

    // Add emergency contacts if Cadastro Completo
    if (!document.getElementById('quickRegister').checked) {
        patient.emergencyContacts.push({
            name: document.getElementById('emergencyContact1').value,
            phone: document.getElementById('emergencyPhone1').value,
        });

        if (document.getElementById('emergencyContact2').value) {
            patient.emergencyContacts.push({
                name: document.getElementById('emergencyContact2').value,
                phone: document.getElementById('emergencyPhone2').value,
            });
        }
    }

    patients.push(patient); // Add patient to the array
    updateDatabase();

    displayPatients(); // Call function to display patients

    // console.log('Patient saved:', patient); // Log to console for verification
    // console.log('All patients:', patients); // Log all patients for verification

    // Optionally, reset the form and close the modal
    this.reset();
    addPatientModal.style.display = 'none';
}

function displayPatients(filteredPatients = '') {
    const patientListDiv = document.getElementById('patient-list');
    patientListDiv.innerHTML = '';

    let displayPatients = null
    if (filteredPatients == '') {
        displayPatients = patients
    } else {
        displayPatients = filteredPatients
    }

    displayPatients.sort((a, b) => {
        return a.name.localeCompare(b.name)
    })
    displayPatients.forEach((patient, index) => {
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card'

        let patientPhotoHtml = ''
        if (patient.photo) {
            patientPhotoHtml = `<img src="${patient.photo} alt="Patient Photo" class="patient-photo">"`
        } else {
            patientPhotoHtml = `    <svg class="patient-photo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>`

        }
        patientCard.innerHTML = `
        ${patientPhotoHtml}
        <div class="info">
            <h3 class="name">${patient.name}</h3>
            <p class="cpf">CPF: ${patient.cpf}</p>
            <p class="email">Email: ${patient.email}</p>
        </div>
        <div class="contact-links">
            <a href="mailto:${patient.email}" class="email-link" target="_blank">
                <i class="fas fa-envelope"></i>
            </a>
            <a href="https://wa.me/${patient.ddd}${patient.telefone}" class="whatsapp-link" target="_blank">
                <i class="fab fa-whatsapp"></i>
            </a>
        </div>
    `;

    patientCard.addEventListener('click', () => { openPatientModalView(patient) })
    patientListDiv.appendChild(patientCard); // Append the new patient card
    })
}

document.querySelector('.search-input-patients').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.cpf.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm)
    );
    displayPatients(filteredPatients);
});

function openPatientModalView(patient) {
    patientModal.dataset.value = patient.name //register actual patient on modal
    modalPatientLoadSessions(patient)

    // Populate modal with patient data
    document.getElementById('full-name').value = patient.name;
    document.getElementById('email-view').value = patient.email;
    document.getElementById('phone-view').value = patient.telefone;
    document.getElementById('birthdate').value = patient.dob;
    document.getElementById('cpf-view').value = patient.cpf;
    document.getElementById('gender-view').value = patient.gender;
    document.getElementById('profession-view').value = patient.profession;
    document.getElementById('country-view').value = patient.country;
    let emergencyContactName1 = patient.emergencyContacts[0]?.name || '';
    let emergencyContactPhone1 = patient.emergencyContacts[0]?.phone || '';
    let emergencyContactName2 = patient.emergencyContacts[1]?.name || '';
    let emergencyContactPhone2 = patient.emergencyContacts[1]?.phone || '';
    document.getElementById('emergency-name-1').value = emergencyContactName1;
    document.getElementById('emergency-phone-1').value = emergencyContactPhone1;
    document.getElementById('emergency-name-2').value = emergencyContactName2;
    document.getElementById('emergency-phone-2').value = emergencyContactPhone2;
    document.getElementById('health-plans').value = patient.healthPlan;
    document.getElementById('treatments').value = patient.treatment;
    document.getElementById('medications').value = patient.medication;

    // Create contact links
    const contactLinksContainer = document.querySelector('.contact-links-patient');
    const contactEmergencyContainer1 = document.querySelector('.contact-emergency-container-1')
    const contactEmergencyContainer2 = document.querySelector('.contact-emergency-container-2')

    // Clear previous links
    contactLinksContainer.innerHTML = '';
    contactEmergencyContainer1.innerHTML = '';
    contactEmergencyContainer2.innerHTML = '';

    // Create email link
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${patient.email}`;
    emailLink.className = 'email-link-patient';
    emailLink.target = '_blank';
    emailLink.innerHTML = '<i class="fas fa-envelope"></i>'; // Add your icon

    // Create WhatsApp link
    const whatsappLink = document.createElement('a');
    whatsappLink.href = `https://wa.me/${patient.ddd}${patient.telefone}`;
    whatsappLink.className = 'whatsapp-link-patient';
    whatsappLink.target = '_blank';
    whatsappLink.innerHTML = '<i class="fab fa-whatsapp"></i>'; // Add your icon
    // Create WhatsApp link
    const whatsappLinkEmergency1 = document.createElement('a');
    whatsappLinkEmergency1.href = `https://wa.me/${emergencyContactPhone1}`;
    whatsappLinkEmergency1.className = 'whatsapp-link-patient';
    whatsappLinkEmergency1.target = '_blank';
    whatsappLinkEmergency1.innerHTML = '<i class="fab fa-whatsapp"></i>'; // Add your icon
    const whatsappLinkEmergency2 = document.createElement('a');
    whatsappLinkEmergency2.href = `https://wa.me/${emergencyContactPhone2}`;
    whatsappLinkEmergency2.className = 'whatsapp-link-patient';
    whatsappLinkEmergency2.target = '_blank';
    whatsappLinkEmergency2.innerHTML = '<i class="fab fa-whatsapp"></i>'; // Add your icon

    // Append the links to the container
    contactLinksContainer.appendChild(emailLink);
    contactLinksContainer.appendChild(whatsappLink);
    contactEmergencyContainer1.appendChild(whatsappLinkEmergency1);
    contactEmergencyContainer2.appendChild(whatsappLinkEmergency2);

    patientModal.style.display = 'flex';

    editButtonPatient.onclick = function() {
        const inputs = document.querySelectorAll('.patient-info input, .general-info input, .emergency-contacts input, .health-info input');
        inputs.forEach(input => input.disabled = false); // Enable editing
        editButtonPatient.style.display = 'none'; // Hide the Edit button
        saveButtonPatient.style.display = 'inline'; // Show the Save button
        cancelButtonPatient.style.display = 'inline'; // Show the Cancel button
    };

    cancelButtonPatient.addEventListener('click', () => { cancellPatientEdit(patient) })

    saveButtonPatient.onclick = function() {
        patient.name = document.getElementById('full-name').value;
        patient.email = document.getElementById('email-view').value;
        patient.telefone = document.getElementById('phone-view').value;
        patient.dob = document.getElementById('birthdate').value;
        patient.cpf = document.getElementById('cpf-view').value;
        patient.gender = document.getElementById('gender-view').value;
        patient.profession = document.getElementById('profession-view').value;
        patient.country = document.getElementById('country-view').value;
        patient.emergencyContacts[0] = patient.emergencyContacts[0] || {};
        patient.emergencyContacts[1] = patient.emergencyContacts[1] || {};
        patient.emergencyContacts[0].name = document.getElementById('emergency-name-1').value || '';
        patient.emergencyContacts[0].phone = document.getElementById('emergency-phone-1').value || '';
        patient.emergencyContacts[1].name = document.getElementById('emergency-name-2').value || '';
        patient.emergencyContacts[1].phone = document.getElementById('emergency-phone-2').value || '';
        patient.healthPlan = document.getElementById('health-plans').value;
        patient.treatment = document.getElementById('treatments').value;
        patient.medication = document.getElementById('medications').value;

        const inputs = document.querySelectorAll('.patient-info input, .general-info input, .emergency-contacts input, .health-info input');
        inputs.forEach(input => input.disabled = true); // Disable editing
        editButtonPatient.style.display = 'inline'; // Show the Edit button
        saveButtonPatient.style.display = 'none'; // Hide the Save button
        cancelButtonPatient.style.display = 'none'; // Hide the Cancel button

        updateDatabase()

        displayPatients()
    }

    patientModal.addEventListener('click', (event) => {
        if (event.target === patientModal) { // Check if the click is on the modal background
            cancellPatientEdit(patient)
            patientModal.style.display = 'none';
            selectedEvent = null; // Clear selected event]
        }
    });

    document.getElementById('close-modal-view-patient').onclick = function() {
        cancellPatientEdit(patient)
        document.getElementById('patient-modal').style.display = 'none';
    }
}

function cancellPatientEdit(patient) {
    const inputs = document.querySelectorAll('.patient-info input, .general-info input, .emergency-contacts input, .health-info input');
    inputs.forEach(input => input.disabled = true); // Disable editing
    editButtonPatient.style.display = 'inline'; // Show the Edit button
    saveButtonPatient.style.display = 'none'; // Hide the Save button
    cancelButtonPatient.style.display = 'none'; // Hide the Cancel button

    document.getElementById('full-name').value = patient.name;
    document.getElementById('email-view').value = patient.email;
    document.getElementById('phone-view').value = patient.telefone;
    document.getElementById('birthdate').value = patient.dob;
    document.getElementById('cpf-view').value = patient.cpf;
    document.getElementById('gender-view').value = patient.gender;
    document.getElementById('profession-view').value = patient.profession;
    document.getElementById('country-view').value = patient.country;
    let emergencyContactName1 = patient.emergencyContacts[0]?.name || '';
    let emergencyContactPhone1 = patient.emergencyContacts[0]?.phone || '';
    let emergencyContactName2 = patient.emergencyContacts[1]?.name || '';
    let emergencyContactPhone2 = patient.emergencyContacts[1]?.phone || '';
    document.getElementById('emergency-name-1').value = emergencyContactName1;
    document.getElementById('emergency-phone-1').value = emergencyContactPhone1;
    document.getElementById('emergency-name-2').value = emergencyContactName2;
    document.getElementById('emergency-phone-2').value = emergencyContactPhone2;
    document.getElementById('health-plans').value = patient.healthPlan;
    document.getElementById('treatments').value = patient.treatment;
    document.getElementById('medications').value = patient.medication;

    displayPatients()
    // Optionally, reset input values to the original data (if you store it)
    // console.log('Editing canceled.');
};

const modalPatientViewSideNavSessions = document.getElementById('modal-patient-view-side-nav-sessions')
document.getElementById('modal-patient-view-side-nav-sessions').addEventListener('click', (ev) => {
    ev.preventDefault()

})

const sessionForPatientNewButton = document.getElementById('session-for-patient-new-button')

function modalPatientLoadSessions(patient) {
    if (!patient) { // check if isnt on modal (no patient on dataset)
        return
    }
    const filteredEvents = events.filter((event) => {
        if (event.name == patient.name) {
            return event
        }
    })
    
    const groupedEvents = {}
    filteredEvents.forEach((event) => {
        const eventDate = new Date(event.start);
        const yearMonth = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`; // Format: "YYYY-MM"
    
        // Initialize the array if it doesn't exist
        if (!groupedEvents[yearMonth]) {
            groupedEvents[yearMonth] = {
                monthYear: yearMonth, // Store the month/year
                events: [] // Initialize an empty array for events
            };
        }
    
        // Push the event into the corresponding month/year array
        groupedEvents[yearMonth].events.push(event);
    })
    // Convert the grouped object to an array of arrays
    //const result = Object.values(groupedEvents);
    //console.log(result)

    // Sort the grouped events by year/month in descending order
    const sortedGroupedEvents = Object.values(groupedEvents).sort((a, b) => {
        const [yearA, monthA] = a.monthYear.split('-').map(Number);
        const [yearB, monthB] = b.monthYear.split('-').map(Number);
        return yearB - yearA || monthB - monthA; // Sort by year then month
    });

    // Render the events
    const eventsContainer = document.getElementById('sessions-for-patient-container')
    eventsContainer.innerHTML = ''
    sortedGroupedEvents.forEach(group => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'session-patient-month-container';
    
        const header = document.createElement('div');
        header.className = 'session-patient-month-header';
        header.innerHTML = `<span>${group.monthYear}</span><span>▼</span>`;
        header.addEventListener('click', () => {
            const eventsList = monthDiv.querySelector('.session-patient-events-list');
            const isExpanded = eventsList.style.maxHeight; // Check if expanded
            if (isExpanded) {
                eventsList.style.maxHeight = null; // Collapse
                header.querySelector('span:last-child').innerText = '▼'; // Change arrow
            } else {
                eventsList.style.maxHeight = eventsList.scrollHeight + 'px'; // Expand
                header.querySelector('span:last-child').innerText = '▲'; // Change arrow
            }
        });
        const eventsList = document.createElement('div');
        eventsList.className = 'session-patient-events-list';
    
        let annotationExistsText = null
        let annotationExistsFunction = null
        let medicalRecordsExistsText = null
        group.events.sort((a, b) => new Date(b.start) - new Date(a.start)).forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'session-patient-event-item';
            // const date = event.start.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const day = event.start.toLocaleString('pt-BR', { day: '2-digit', hour: '2-digit', minute: '2-digit' });

            annotationExistsText = 'Criar anotação'
            annotationExistsFunction = `onclick="{ disableAllDisplays(); sessionsGeneralVisionSection.style.display = 'flex'; displaySessions(); modifyExistingSession('${event.name}', '${event.start}') }"`
            medicalRecordsExistsText = 'Criar prontuário'
            if (typeof(event.annotations) == 'string') { // if annotation already exists
                annotationExistsText = 'Exibir anotação'
                // annotationExistsFunction = `onclick="{ disableAllDisplays(); sessionsGeneralVisionSection.style.display = 'flex'; displaySessions(); modifyExistingSession('${event.name}', '${event.start}') }"`
            }
            if (typeof(event.medicalRecords) == 'string') {
                medicalRecordsExistsText = 'Exibir prontuário'
                // annotationExistsFunction = `onclick="{ disableAllDisplays(); sessionsGeneralVisionSection.style.display = 'flex'; displaySessions(); modifyExistingSession('${event.name}', '${event.start}') }"`
            }


            eventItem.innerHTML = `
                <span>Dia ${day} - ${event.name}</span>
                <div>
                    <button ${annotationExistsFunction}>${annotationExistsText}</button>
                    <button ${annotationExistsFunction}>${medicalRecordsExistsText}</button>
                    <button onclick="deletePatientSessionItem('${event.name}', '${event.start}')">🗑️</button>
                </div>
            `;
            eventsList.appendChild(eventItem);
        });
    
        monthDiv.appendChild(header);
        monthDiv.appendChild(eventsList);
        eventsContainer.appendChild(monthDiv);
    });

    //New session button
    sessionForPatientNewButton.addEventListener('click', () => {
        disableAllDisplays(); sessionsGeneralVisionSection.style.display = 'flex'; displaySessions(); sessionSelectDisplay('create-new'); sessionSelect.value = 'create-new';
    })
    
}
// Function to handle event deletion
function deletePatientSessionItem(eventName, eventStart) {
    let patientObject = ''
    const confirmation = confirm(`Are you sure you want to delete ${eventName}?`);
    if (confirmation) {
        try{
            const patient = patients.find((patient) => patient.name == eventName)
            patientObject = patient
            const selectedEventPatient = patient.events.find((event) => event.start == eventStart)
            patient.events = patient.events.filter((event) => event != selectedEventPatient)
            const selectedEventEvent = events.find((event) => event.start == eventStart)
            events = events.filter((event) => event != selectedEventEvent)
        } catch {
            alert('Error in deleting event')
        }

        updateDatabase()
        
        alert(`${eventName} has been deleted.`);
        modalPatientLoadSessions(patientObject)
    }
}

document.querySelectorAll('.side-nav li').forEach(item => {
    item.addEventListener('click', function() {
        // Remove active class from all items
        document.querySelectorAll('.side-nav li').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        
        // Show the selected view
        const viewId = item.getAttribute('data-view');
        document.getElementById(viewId).classList.add('active');
    });
});

displayPatients()


// Function to display the correct session view
sessionSelect.addEventListener('change', function() {
    const selectedValue = sessionSelect.value;
    sessionSelectDisplay(selectedValue)

    displaySessions()
});
function sessionSelectDisplay(selectedValue) {
        // Reset visibility
        openSessionView.style.display = 'none';
        createSessionView.style.display = 'none';
        modifySessionView.style.display = 'none';
    
        const annotation = document.getElementById('annotation');
        const annotationReport = document.getElementById('annotation-report');
        annotation.innerHTML = ''
        annotationReport.innerHTML = ''

        // Show the relevant section
        if (selectedValue === 'open-existing') {
            openSessionView.style.display = 'block';

        } else if (selectedValue === 'create-new') {
            createSessionView.style.display = 'block';
        }
}

// Function to simulate modifying a session (for demo)
function modifyExistingSession(patientName, sessionDateTime) {
    sessionSelect.value = ''; // Clear selection
    openSessionView.style.display = 'none';
    createSessionView.style.display = 'none';
    
    // Set patient info for modification
    document.getElementById('selected-patient').textContent = patientName;
    document.getElementById('session-datetime-display').textContent = sessionDateTime;
    modifySessionView.style.display = 'block';
    
    patients.find((patient) => patient.name == patientName).events.forEach((event) => {

        // correction of string dates from db
        event.start = new Date(event.start)
        event.end = new Date(event.end)

        const stringEventStart = event.start.toString()
        const stringSessionDateTime = sessionDateTime.toString()

        if(stringEventStart == stringSessionDateTime) {
            if (event.annotations != []) {
                document.getElementById('annotation').innerHTML = event.annotations
            } else { document.getElementById('annotation').innerHTML = '' }
            if (event.medicalRecords != []) {
                document.getElementById('annotation-report').innerHTML = event.medicalRecords
            } else { document.getElementById('annotation-report').innerHTML = '' }
        }
    })
}

const saveSessionButton = document.getElementById('save-session')
saveSessionButton.addEventListener('click', (ev) => {
    // ev.preventDefault()

    // Get selected patient name
    const selectedPatientName = document.getElementById('selected-patient').textContent;
    const selectedDateTime = document.getElementById('session-datetime-display').textContent;
    const annotation = document.getElementById('annotation').innerHTML;
    const annotationReport = document.getElementById('annotation-report').innerHTML;

    // Filter to find the matching patient
    const filteredPatients = patients.filter(patient => patient.name === selectedPatientName);

    // Check if the patient exists
    if (filteredPatients.length === 0) {
        alert('Erro: paciente não encontrado');
        return;
    }

    // Assuming you're dealing with the first matched patient
    const patient = filteredPatients[0];

    // Convert the selectedDateTime string to a Date object
    const targetDate = new Date(selectedDateTime); // Ensure it's in the correct format

    // Find the event that matches the target date
    const matchingEventsPatients = patient.events.filter(event => {
        // Create a Date object for the start of the event
        const eventStart = new Date(event.start);
        
        // Compare only the date parts (year, month, day)
        return eventStart.getFullYear() === targetDate.getFullYear() &&
        eventStart.getMonth() === targetDate.getMonth() &&
        eventStart.getDate() === targetDate.getDate() &&
        eventStart.getHours() === targetDate.getHours() &&
        eventStart.getMinutes() === targetDate.getMinutes();
    });
    matchingEventsPatients[0].annotations = annotation;
    matchingEventsPatients[0].medicalRecords = annotationReport;

    const matchingEventsEvents = events.filter(event => {
        // Create a Date object for the start of the event
        const eventStart = new Date(event.start);
        
        // Compare only the date parts (year, month, day)
        return eventStart.getFullYear() === targetDate.getFullYear() &&
        eventStart.getMonth() === targetDate.getMonth() &&
        eventStart.getDate() === targetDate.getDate() &&
        eventStart.getHours() === targetDate.getHours() &&
        eventStart.getMinutes() === targetDate.getMinutes() &&
        event.name === selectedPatientName;
    });
    matchingEventsEvents[0].annotations = annotation;
    matchingEventsEvents[0].medicalRecords = annotationReport;

    // console.log(matchingEvents)
    // console.log(patients)
    // console.log(matchingEventsEvents)
    // console.log(events)

    updateDatabase()

    let confirm = null
    let printed = false
    confirm = window.confirm('Salvando o seu conteúdo! Deseja imprimir uma cópia?')
    if (confirm) {
        printDivs('annotation', 'annotation-report', matchingEventsEvents[0].name, matchingEventsEvents[0].start)
    }
    displaySessions()
    //disableAllDisplays() ;sessionsGeneralVisionSection.style.display = 'flex'; displaySessions(); sessionSelectDisplay('open-existing'); sessionSelect.value = 'open-existing'
    //goHome()
});

function printDivs(divId1, divId2, titleName, titleDate) {
    const title = `${String(titleDate.getFullYear())}-${String(titleDate.getMonth()).padStart(2, '0')}-${String(titleDate.getDay()).padStart(2, '0')} - ${titleName} - Prontuário`
    const printContent1 = document.getElementById(divId1).innerHTML || '';
    const printContent2 = document.getElementById(divId2).innerHTML || '';

    // Open a new window (make sure it's not blocked)
    var printWindow = window.open('', '', 'height=500, width=800');

    if (printWindow) {
        // Create a new HTML structure in the new window
        printWindow.document.documentElement.innerHTML = `
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                    </style>
                </head>
                <body>
                    <h2>Prontuário</h2>
                    ${printContent2} <!-- Insert the content to be printed -->
                    </br>
                    </br>
                    <h3>Anotações</h3>
                    ${printContent1} <!-- Insert the content to be printed -->
                </body>
            </html>
        `;

        // Make sure the document is fully rendered
        printWindow.document.close();

        // Trigger the print dialog
        printWindow.focus();
        printWindow.print();

        // Optionally, close the print window after printing
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    } else {
        alert('Pop-up blocked. Please allow pop-ups for this site.');
    }
}

function formatText(command) {
    document.execCommand(command, false, null);
    toggleActiveButton(event.target);
}

function formatHeading(annotationContext) {
    let select = null
    if (annotationContext == 'annotation') {
        select = document.getElementById('heading-select-annotation');
    } else if (annotationContext == 'report') {
        select = document.getElementById('heading-select-report');
    }
    const heading = select.value;

    // Remove any existing heading tags
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    if (heading) {
        const selectedText = range.toString();
        const newElement = document.createElement(heading);
        newElement.textContent = selectedText;
        range.deleteContents();
        range.insertNode(newElement);
        select.selectedIndex = 0; // Reset to normal
    }

}

function removeFormat() {
    const annotation = document.getElementById('annotation');// report
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
        const textNode = document.createTextNode(selectedText);
        range.deleteContents();
        range.insertNode(textNode);
    }
}

function toggleActiveButton(button) {
    // if (button.style.backgroundColor == 'rgb(170, 98, 238)') {
    //     button.style.backgroundColor = '#ffffff'
    // } else {
    //     button.style.backgroundColor = '#aa62ee'
    // }
}

document.getElementById('search-patient').addEventListener('input', filterDataSessions);
document.getElementById('date-input').addEventListener('input', filterDataSessions);


const searchPatientCreateInput = document.getElementById('search-patient-create');
const patientSuggestionsCreateSession = document.getElementById('patient-suggestions-create-session');
const selectDatetimeNow = document.getElementById('select-now')
const selectedDateAndTime = document.getElementById('session-datetime');

searchPatientCreateInput.addEventListener('input', filterDataNewSession);
selectDatetimeNow.addEventListener('click', () => {
    const now = new Date();
    now.setHours(now.getHours() - 3) //Subtract 3 hours due brazilia fuse
    const formattedDate = now.toISOString().slice(0, 16); // Get the date in yyyy-MM-ddThh:mm format
    selectedDateAndTime.value = formattedDate
})
document.getElementById('create-session-btn').addEventListener('click', createNewSessionValidation);

function filterDataNewSession() {
    const searchTerm = searchPatientCreateInput.value.toLowerCase();
    if (!searchTerm) {
        patientSuggestionsCreateSession.style.display = 'none';
    }
    
    // Filter patients based on search term
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.cpf.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm)
    );

    patientSuggestionsCreateSession.innerHTML = '';
    filteredPatients.forEach(patient => {
        const li = document.createElement('li')
        li.textContent = patient.name;
        li.addEventListener('click', () => {
            searchPatientCreateInput.value = patient.name; //populate input with the selected name
            patientSuggestionsCreateSession.style.display = 'none'; // hide suggestions
        });
        patientSuggestionsCreateSession.appendChild(li)
    });

    // Show suggestions if there are results
    patientSuggestionsCreateSession.style.display = filteredPatients.length ? 'flex' : 'none';

}
document.addEventListener('click', (event) => {
    const isClickInside = patientSuggestionsCreateSession.contains(event.target) || searchPatientCreateInput.contains(event.target);
    if (!isClickInside) {
        patientSuggestionsCreateSession.style.display = 'none'; // Hide suggestions
    }
});

function createNewSessionValidation() {
    let isNameValid = false
    let isDateValid = false
    events.forEach(event => {
        if (event.name === searchPatientCreateInput.value) {
            isNameValid = true;
        }
    })
    if (!isNameValid) {
        searchPatientCreateInput.classList.add('unvalidated-element-create-session')
    } else {
        searchPatientCreateInput.classList.remove('unvalidated-element-create-session')
    }

    const selectedValue = selectedDateAndTime.value
    const selectedDate = new Date(selectedValue)
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    if (
        year < 1970 || // Example: minimum valid year
        month < 0 || month > 11 || // Month should be between 0 and 11
        day < 1 || day > 31 || // Day should be between 1 and 31
        hours < 0 || hours > 23 || // Hours should be between 0 and 23
        minutes < 0 || minutes > 59 // Minutes should be between 0 and 59
    ) {
        selectedDateAndTime.classList.add('unvalidated-element-create-session')
        isDateValid = false;
    } else {
        selectedDateAndTime.classList.remove('unvalidated-element-create-session')
        isDateValid = true;
    }

    if (selectedDate == 'Invalid Date') {
        selectedDateAndTime.classList.add('unvalidated-element-create-session')
        isDateValid = false;
    } 
    
    if (isNameValid && isDateValid) {
        createNewSession()
    }
}

function createNewSession() {
    const name = searchPatientCreateInput.value;
    const start = new Date(selectedDateAndTime.value);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60)
    const recurrence = 'none';
    const duration = '60';
    const type = 'presencial';
    const color = "#c75252";
    const notes = '';

    const annotations = []
    const medicalRecords = []

    const event = {
        name,
        start,
        end,
        recurrence,
        duration,
        type,
        color,
        notes,
        annotations,
        medicalRecords,
    };
    
    const filteredPatient = patients.filter(patient => 
        patient.name === name
    )
    if (filteredPatient.length === 0) {
        alert('Erro: paciente não encontrado')
        return
    }

    const patient = filteredPatient[0]
    patient.events.push(event)
    // Store the event in the events array
    events.push(event);
    
    updateDatabase()

    searchPatientCreateInput.value = '';
    selectedDateAndTime.value = '';

    modifyExistingSession(name, start)
}

function filterDataSessions() {
    const searchTerm = document.getElementById('search-patient').value.toLowerCase();
    const selectedMonthYear = document.getElementById('date-input').value;

    // Filter patients based on search term
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.cpf.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm)
    );

    // Filter events based on filtered patients and selected date
    const filteredEvents = events.filter(event => {
        const matchesPatient = filteredPatients.some(patient =>
            patient.name.toLowerCase().includes(event.name.toLowerCase())
        );

        const eventDate = new Date(event.start);
        // const matchesDate = selectedDate ? eventDate.toISOString().slice(0, 10) === selectedDate : true;
        // console.log(matchesDate, eventDate, selectedDate)
        // return matchesPatient && matchesDate;

    // Split the month and year from the input
        const [year, month] = selectedMonthYear.split('-').map(Number); // 'YYYY-MM'

        // Check if the event's month and year match the selected month and year
        const matchesMonthYear = eventDate.getFullYear() === year && eventDate.getMonth() === (month - 1); // Month is zero-indexed

        return matchesPatient && (selectedMonthYear ? matchesMonthYear : true);
    });

    displaySessions(filteredEvents);
}
let displayedCount = 6
function displaySessions(filteredSessions = '') {
    listSessions.innerHTML = ''
    let eventArray = events
    if (filteredSessions) {
        eventArray = filteredSessions
    }
    const sortedEvents = eventArray.sort((a, b) => {
        return new Date(b.start) - new Date(a.start);
    })

    const sessionsToDisplay = sortedEvents.slice(0, displayedCount);

    sessionsToDisplay.forEach(event => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-card'
    
        const nameSessionCard = document.createElement('h4');
        const dateSessionCard = document.createElement('p');
        nameSessionCard.innerText = event.name;
        nameSessionCard.style.margin = '0px';

        // correction of string dates from db
        event.start = new Date(event.start)
        event.end = new Date(event.end)

        dateSessionCard.innerText = formatDate(event.start);
        dateSessionCard.style.margin = '0px';

        sessionCard.appendChild(nameSessionCard);
        sessionCard.appendChild(dateSessionCard);
        sessionCard.addEventListener('click', () => { modifyExistingSession(event.name, new Date(event.start)) })
        listSessions.appendChild(sessionCard); // Append the new patient card
    })

    let showMoreButton = document.querySelector('.show-more-button');
    if (showMoreButton) {
        showMoreButton.remove();
    }

    if (displayedCount < sortedEvents.length) {
        const showMoreButton = document.createElement('button');
        showMoreButton.innerText = 'Mostrar mais';
        showMoreButton.margin = '15px';
        showMoreButton.style.display = 'flex';
        showMoreButton.style.justifySelf = 'center';
        showMoreButton.style.padding = '20px 25px';
        showMoreButton.style.backgroundColor = '#28a745';
        showMoreButton.style.color = 'white';
        showMoreButton.style.border = 'none';
        showMoreButton.style.borderRadius = '4px';
        showMoreButton.style.cursor = 'pointer';
        showMoreButton.style.transition = 'transform 0.3s';
        showMoreButton.className = 'show-more-button'
        showMoreButton.addEventListener('click', () => {
            displayedCount += 6; // Increase count by 6
            displaySessions(); // Re-display sessions
        });
        openSessionView.appendChild(showMoreButton); // Append the button
    }
        // nameSessionCard.value = 
    //     let patientPhotoHtml = ''
    //     if (patient.photo) {
    //         patientPhotoHtml = `<img src="${patient.photo} alt="Patient Photo" class="patient-photo">"`
    //     } else {
    //         patientPhotoHtml = `    <svg class="patient-photo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //     <circle cx="12" cy="7" r="4" />
    //     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    // </svg>`

    //     }
    //     patientCard.innerHTML = `
    //     ${patientPhotoHtml}
    //     <div class="info">
    //         <h3 class="name">${patient.name}</h3>
    //         <p class="cpf">CPF: ${patient.cpf}</p>
    //         <p class="email">Email: ${patient.email}</p>
    //     </div>
    //     <div class="contact-links">
    //         <a href="mailto:${patient.email}" class="email-link" target="_blank">
    //             <i class="fas fa-envelope"></i>
    //         </a>
    //         <a href="https://wa.me/${patient.ddd}${patient.telefone}" class="whatsapp-link" target="_blank">
    //             <i class="fab fa-whatsapp"></i>
    //         </a>
    //     </div>
    // `;


}

displaySessions()

function updateDatabase() {
    //preventWriteDatabase = false
    if (!preventWriteDatabase) {
        fetch('http://localhost:3000/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ events, patients })
        })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Erro:', error));
    } else {
        console.log('Ocorreu um erro atualizar as informações, por favor, verifique sua conexão com a internet e tente recarregar a página (F5).')
    }
}