import {evaluateShot} from "./game_logic.js"; 

//Una nave verticale di 2 celle che occupa: (5,3), (6,3)
const ships = [
    {id: 1, size: 2, start_row: 5, start_col: 3, orientation: 'V'}
];

//caso A: sparo (0,0) -> non c'è nulla
console.log("A 0,0: ", evaluateShot(0, 0, ships, [])); 

//B: sparo su (5,3)
console.log("B 5,3: ", evaluateShot(5,3,ships, [])); 

// Caso C: (5,3) già colpita prima, ora sparo su (6,3) → affondata!
const shots = [{ row: 5, col: 3, result: 'hit' }];
console.log("C (6,3):", evaluateShot(6, 3, ships, shots)); 
