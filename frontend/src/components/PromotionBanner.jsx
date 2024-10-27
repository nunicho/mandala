import React, { useState, useEffect } from "react";
import { useGetPromotionsQuery } from "../slices/promotionsApiSlice";
//import "../assets/styles/promotionBanner.css";

const PromotionBanner = () => {
  const { data: promotions, error, isLoading } = useGetPromotionsQuery();
  const [activePromotions, setActivePromotions] = useState([]);
  const [timeLeft, setTimeLeft] = useState([]);
  const [isVisible, setIsVisible] = useState(true); // Estado para controlar la visibilidad del banner

  // Check sessionStorage to determine if the banner should be visible
  useEffect(() => {
    const bannerClosed = sessionStorage.getItem("bannerClosed");
    if (bannerClosed === "true") {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (promotions) {
      const currentPromotions = promotions.filter(
        (promo) => promo.active && new Date(promo.endDate) > new Date()
      );
      setActivePromotions(currentPromotions);
    }
  }, [promotions]);

  useEffect(() => {
    if (activePromotions.length === 0) return;

    const calculateTimeLeft = () => {
      const newTimeLeft = activePromotions.map((promotion) => {
        const endDate = new Date(promotion.endDate);
        const now = new Date();
        const difference = endDate - now;

        if (difference <= 0) {
          return {
            id: promotion._id,
            timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return {
          id: promotion._id,
          timeLeft: { days, hours, minutes, seconds },
        };
      });

      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [activePromotions]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading promotions</div>;
  if (activePromotions.length === 0 || !isVisible) return null; // Condición para no mostrar el banner si no está visible

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("bannerClosed", "true");
  };

  return (
    <div className="promotion-banner">
      <button className="close-button" onClick={handleClose}>
        &times; {/* X en el botón */}
      </button>
      <div className="promotions-container">
        {activePromotions.map((promotion, index) => (
          <div key={promotion._id} className="promotion-item">
            <div className="promotion-content">
              <h5>{promotion.name}</h5>
              <p>{promotion.description}</p>

              <div className="timer">
                <p> Finaliza: </p>
                <span>
                  {String(timeLeft[index]?.timeLeft?.days).padStart(2, "0")}{" "}
                  días
                </span>
                <span>
                  {String(timeLeft[index]?.timeLeft?.hours).padStart(2, "0")}{" "}
                  horas
                </span>
                <span>
                  {String(timeLeft[index]?.timeLeft?.minutes).padStart(2, "0")}{" "}
                  minutos
                </span>
                <span>
                  {String(timeLeft[index]?.timeLeft?.seconds).padStart(2, "0")}{" "}
                  segundos
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionBanner;
/*
import React, { useState, useEffect } from "react";
import { useGetPromotionsQuery } from "../slices/promotionsApiSlice";
import "../assets/styles/promotionBanner.css";

const PromotionBanner = () => {
  const { data: promotions, error, isLoading } = useGetPromotionsQuery();
  const [activePromotions, setActivePromotions] = useState([]);
  const [timeLeft, setTimeLeft] = useState([]);

  useEffect(() => {
    if (promotions) {
      const currentPromotions = promotions.filter(
        (promo) => promo.active && new Date(promo.endDate) > new Date()
      );
      setActivePromotions(currentPromotions);
    }
  }, [promotions]);

  useEffect(() => {
    if (activePromotions.length === 0) return;

    const calculateTimeLeft = () => {
      const newTimeLeft = activePromotions.map((promotion) => {
        const endDate = new Date(promotion.endDate);
        const now = new Date();
        const difference = endDate - now;

        if (difference <= 0) {
          return {
            id: promotion._id,
            timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return {
          id: promotion._id,
          timeLeft: { days, hours, minutes, seconds },
        };
      });

      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [activePromotions]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading promotions</div>;
  if (activePromotions.length === 0) return null;

  return (
    <div className="promotion-banner">
      <h1>¡PROMOCIONES!</h1>
      <div className="promotions-container">
        {activePromotions.map((promotion, index) => (
          <div key={promotion._id} className="promotion-item">
            <h2>{promotion.name}</h2>
            <div className="timer">
              <span>
                {String(timeLeft[index]?.timeLeft?.days).padStart(2, "0")}d
              </span>
              <span>
                {String(timeLeft[index]?.timeLeft?.hours).padStart(2, "0")}h
              </span>
              <span>
                {String(timeLeft[index]?.timeLeft?.minutes).padStart(2, "0")}m
              </span>
              <span>
                {String(timeLeft[index]?.timeLeft?.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionBanner;
*/
