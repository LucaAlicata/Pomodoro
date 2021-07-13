const inquirer = require('inquirer');
const progress = require('cli-progress');
const notifier = require('node-notifier');

const questions =[
    {
        type: 'input',
        name: 'nOfHours',
        message: "Quante ore hai a disposizione? ",
        default: 1,
    },
    {
        type: 'input',
        name: 'pomLength',
        message: "Quanto dura un pomodoro? ",
        default: 25,
    },
    {
        type: 'input',
        name: 'pauseLength',
        message: "Quanto dura una pausa? ",
        default: 5,
    },
    {
        type: 'input',
        name: 'longPauseLength',
        message: "Quanto dura la pausa lunga? ",
        default: 30,
    }
];

let length = 1;
let work = 25;
let pause = 5;
let longpause = 30;

let pauseTimer = true;
let multibar;

let wlValue = 0;
let plValue = 0;
let lplValue = 0;

let pomodoros = 0;

let fullLength;
let workLength;
let pauseLength;


const main = async () =>{
    const inq = await getInquirer();

    length = inq.nOfHours * 60;
    work = inq.pomLength;
    pause = inq.pauseLength;
    longpause = inq.longPauseLength;

    createMultibar();
    startWorkTimer();
}

const createMultibar = async () => {
    multibar = new progress.MultiBar({
        clearOnComplete: false,
        hideCursor: true
    }, progress.Presets.shades_grey);
    
    workLength = multibar.create(length, 0);
    pauseLength = multibar.create(pause, 0);
    longPauseLength = multibar.create(longpause, 0);
}

const getInquirer = async ()=> {
    const arg = await inquirer.prompt(questions).catch((error) => {
        console.log(error);
    })
    return arg;
}

const endPomodoro = () => {
    multibar.stop();
    notifier.notify({
        title: 'Pomodoro',
        message: 'sessione finita',
        timeout: 5
      });
    
};

const startWorkTimer = async () => {

    const timer = await setInterval(async function(){
        if(pauseTimer){
            wlValue++;
            workLength.update(wlValue);
        }

        if (wlValue % work == 0 && pauseTimer){
            pomodoros++;
            
            if(pomodoros % 4 == 0 && pomodoros != 0) 
                startLongPauseTimer(); 
            else 
                startPauseTimer();

            pauseTimer = false;
        }

        if (wlValue >= workLength.getTotal()){
            clearInterval(timer);
            workLength.stop();
            workLength.update(wlValue);
            endPomodoro();
        }

    }, length);

}

const startPauseTimer = async () => {
        if(pause >= 0 && pause <= 10) pause *= 20;
        if(pause >= 0 && pause <= 20) pause *= 10;

        const timer = setInterval( function(){

        plValue++;
        pauseLength.update(plValue)
    
        if(wlValue>=workLength.getTotal() -1){
            plValue = 0;
            pauseLength.update(plValue);
            clearInterval(timer);
            pauseLength.stop();
        }

        if (plValue >= pauseLength.getTotal()){
            clearInterval(timer);
            pauseLength.stop();
            plValue = 0;
            pauseLength.update(plValue);
            pauseTimer = true;
        }
    }, pause);

}

const startLongPauseTimer = async () => {
        
    const timer = setInterval( function(){

    lplValue++;
    longPauseLength.update(lplValue);

    if(wlValue>=workLength.getTotal() -1){
        lplValue = 0;
        longPauseLength.update(lplValue);
        clearInterval(timer);
        longPauseLength.stop();
    }

    if (lplValue >= longPauseLength.getTotal()){
        clearInterval(timer);
        longPauseLength.stop();
        lplValue = 0;
        longPauseLength.update(lplValue);
        pauseTimer = true;
    }
}, longpause);

}




main();