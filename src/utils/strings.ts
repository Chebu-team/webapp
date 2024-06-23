export const strings = {
    formatNumberWithSpaces: (value: string): string => {
        const numericValue = value.replace(/[^0-9.]+/g, "");
        if (isNaN(parseFloat(numericValue)) && numericValue !== "") {
            return value;
        }
        let [wholePart, decimalPart] = numericValue.split(".");
        wholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        const formattedValue = decimalPart
            ? `${wholePart}.${decimalPart}`
            : wholePart;
        return formattedValue;
    },
    addCommas: (str: string): string =>
        str
            .toString()
            .split("")
            .reverse()
            .join("")
            .replace(/\d{3}(?=\d)/g, "$&,")
            .split("")
            .reverse()
            .join(""),
    removeDuplicateSubstring: (s: string) => {
        for (let i = 0; i < s.length; i++) {
            const substring = s.slice(0, i);
            if (substring && s.slice(i).startsWith(substring)) {
                return substring;
            }
        }
        return s;
    },
};
