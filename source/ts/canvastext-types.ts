export interface CanvasTextFunctionsIface {
    letters: {
        [key: string]: {
            width: number,
            points: Array<any>
        }
    }
    letter: Function,
    ascent: Function,
    descent: Function,
    measure: Function,
    draw: Function,
    enable: Function
};

export interface CanvasSingleLetter {
    width: number,
    points: Array<any>
};