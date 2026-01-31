import { IoStarHalfSharp, IoStarOutline, IoStarSharp } from "react-icons/io5";

const StarRating = ({ rating, textSize }) => {

    const totalStars = 5;

    return (
        <div className={`flex text-[#F6A355] text-[${textSize || "15px"}]`}>
        {[...Array(totalStars)].map((_, index) => {
            const starNumber = index + 1;

            if (rating >= starNumber) {
            return <IoStarSharp key={index} />;
            }

            if (rating >= starNumber - 0.5) {
            return <IoStarHalfSharp  key={index} />;
            }

            return <IoStarOutline  key={index} />;
        })}
        </div>
    );
};

export default StarRating;
