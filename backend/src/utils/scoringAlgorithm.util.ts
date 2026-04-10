export const calculatePowerScore = (easy: number, medium: number, hard: number): number => {
    return (easy * 1) + (medium * 3) + (hard * 6);
};
