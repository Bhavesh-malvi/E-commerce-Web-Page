import { useState } from "react";

const GetStarRating = ({ totalStars = 5, onChange }) => {

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1 mt-5">
            {[...Array(totalStars)].map((_, index) => {
            const starValue = index + 1;

                return (
                    <button
                        key={starValue}
                        type="button"
                        className={`text-5xl transition-colors duration-300 ${
                            starValue <= (hover || rating)
                                ? "text-yellow-500"
                                : "text-gray-300"
                        }`}
                        onClick={() => {
                            setRating(starValue);
                            onChange && onChange(starValue);
                        }}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
};

export default GetStarRating;
