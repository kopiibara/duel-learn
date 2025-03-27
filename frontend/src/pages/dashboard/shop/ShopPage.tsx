import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PremiumAdsBG from "/shop-picture/premium-ads-bg.png";
import PremiumActivatedBG from "/shop-picture/PremiumActivatedBG.png";
import CoinIcon from "/CoinIcon.png";
import ShopItemModal from "./Modals/ShopItemModal";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import { ShopItem } from "../../../types/shopObject"; // Import the ShopItem interface
import axios from "axios";
import { useUser } from "../../../contexts/UserContext";

const Shop = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const userCoins = user?.coins || 0;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isPremium, _setIsPremium] = useState(false);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track owned items
  const [ownedItems, setOwnedItems] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Fetch shop items
        const itemsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/shop/items`
        );
        setItems(itemsResponse.data);

        // If user is logged in, fetch their owned items
        if (user?.firebase_uid) {
          // Fetch user's items
          const userItemsResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/shop/user-item/${
              user.firebase_uid
            }`
          );

          // Use the quantity that now comes directly from the database
          const owned: Record<string, number> = {};
          userItemsResponse.data.forEach((item: any) => {
            owned[item.item_code] = item.quantity;
          });

          setOwnedItems(owned);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch shop data:", err);
        setError("Failed to load shop data. Please try again later.");
        setLoading(false);
      }
    };

    fetchItems();
  }, [user?.firebase_uid]);

  const openModal = (item: ShopItem) => {
    const ownedCount = ownedItems[item.item_code] || 0;
    if (ownedCount < 5) {
      setSelectedItem(item);
      setQuantity(1);
      setIsModalOpen(true);
    } else {
      alert("You cannot own more than 5 of this item.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleIncrement = () => {
    if (selectedItem) {
      const ownedCount = ownedItems[selectedItem.item_code] || 0;
      if (quantity < 5 - ownedCount) {
        setQuantity(quantity + 1);
      }
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handlePurchase = async (
    itemCode: string,
    quantity: number,
    itemName: string,
    itemPrice: number
  ) => {
    if (!user?.firebase_uid) {
      alert("You need to be logged in to make a purchase.");
      return false;
    }

    try {
      // Send the purchase request with quantity
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/shop/buy-item`,
        {
          firebase_uid: user.firebase_uid,
          username: user.username,
          item_code: itemCode,
          item_name: itemName,
          item_price: itemPrice,
          quantity: quantity,
        }
      );

      if (response.data.remainingCoins !== undefined) {
        // Use the updateUser function from your user context correctly
        // This will update both state and localStorage
        updateUser({
          coins: response.data.remainingCoins,
        });

        console.log("Updated user coins to:", response.data.remainingCoins);
      }

      // Update owned items count
      setOwnedItems((prev) => ({
        ...prev,
        [itemCode]: (prev[itemCode] || 0) + quantity,
      }));

      return true;
    } catch (err: any) {
      console.error("Purchase failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to complete purchase. Please try again.";

      if (err.response?.data?.message === "Insufficient coins") {
        alert(`You don't have enough coins for this purchase.`);
      } else {
        alert(errorMessage);
      }
      return false;
    }
  };

  const getImagePaddingClass = (itemCode: string) => {
    // You can adjust this based on item codes or other properties
    switch (itemCode) {
      case "MANAREGEN":
        return "pt-3";
      case "TECHPASS":
        return "pt-4 scale-110";
      case "REWARDMULT":
        return "pt-3";
      case "FORTUNECOIN":
        return "pt-3";
      case "INSIGHTTOKEN":
        return "pt-3";
      case "STUDYPACK":
        return "pt-3 scale-150 pl-2";
      default:
        return "";
    }
  };

  return (
    <PageTransition>
      <DocumentHead title="Shop | Duel Learn" />
      <div className="h-full w-full text-white px-3 sm:px-6 pb-6">
        {/* Premium section with responsive adjustments */}
        {!isPremium && (
          <div
            className="h-auto min-h-[200px] sm:h-[232px] rounded-lg p-4 sm:p-6 text-center mb-4 sm:mb-6 flex flex-col justify-center items-center"
            style={{
              backgroundImage: `url(${PremiumAdsBG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2 font-bold">
              Go Premium!
            </h1>
            <p className="text-[14px] sm:text-[16px] w-full sm:w-[360px] px-2 sm:px-0">
              Unlock advanced tools. Earn exclusive rewards. Enjoy ad-free
              learning!
            </p>
            <button
              className="mt-3 sm:mt-4 px-6 sm:px-10 py-2 text-[16px] sm:text-[19px] bg-white text-[#9F87E5] rounded-full font-bold"
              onClick={() => navigate("/dashboard/buy-premium-account")}
            >
              TRY IT NOW
            </button>
          </div>
        )}

        {/* Premium activated section with responsive adjustments */}
        {isPremium && (
          <div
            className="h-auto min-h-[200px] sm:h-[232px] rounded-lg p-4 sm:p-6 text-center mb-4 sm:mb-6 flex flex-col justify-center items-center"
            style={{
              backgroundImage: `url(${PremiumActivatedBG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2 font-bold">
              Premium Perks Unlocked!
            </h1>
            <p className="text-[13px] sm:text-[15px] my-1 sm:my-2 w-full sm:w-[390px] px-2 sm:px-0">
              You're all set to access the best tools and rewards. Stay ahead
              with ad-free, uninterrupted learning.
            </p>
            <button
              className="mt-3 sm:mt-4 px-6 sm:px-10 py-2 text-[14px] sm:text-[15px] bg-white text-[#3e2880] rounded-full font-bold"
              onClick={() => navigate("/dashboard/shop/buy-premium-account")}
            >
              ENDS IN 24D 1H
            </button>
          </div>
        )}

        <hr className="border-t-2 border-[#3B354D] mb-6" />

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Loading shop items...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-red-400">{error}</p>
          </div>
        )}

        {/* Responsive grid for shop items */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {items.map((item) => (
              <div
                key={item.item_code}
                className="border-[0.2rem] border-[#3B354C] rounded-[1rem] shadow-lg py-4 sm:py-7 px-4 sm:px-7 flex flex-col items-center pb-4 aspect-w-1 aspect-h-1 relative"
              >
                <div className="relative">
                  <img
                    src={item.item_picture_url}
                    alt={item.item_name}
                    className={`w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3 sm:mb-4 rounded ${getImagePaddingClass(
                      item.item_code
                    )}`}
                  />
                </div>
                <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
                  {item.item_name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 text-center">
                  {item.item_description}
                </p>
                <div className="flex-grow"></div>
                <div className="flex gap-2 mb-2 sm:mb-3 w-full">
                  {(ownedItems[item.item_code] || 0) > 0 && (
                    <button className="flex-1 border rounded-lg border-[#afafaf] text-white py-1.5 sm:py-2 text-sm sm:text-base hover:bg-[#544483]">
                      Use ({ownedItems[item.item_code] || 0})
                    </button>
                  )}

                  {(ownedItems[item.item_code] || 0) < 5 && (
                    <button
                      className="flex-1 border rounded-lg border-[#afafaf] text-black py-1.5 sm:py-2 bg-white flex items-center justify-center hover:bg-[#e0e0e0] text-sm sm:text-base"
                      onClick={() => openModal(item)}
                    >
                      <span>Buy for </span>
                      <img
                        src={CoinIcon}
                        alt="Coin"
                        className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2"
                      />
                      <span
                        style={{
                          color: "#9C8307",
                          marginLeft: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {item.item_price}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop Item Modal */}
      {selectedItem && (
        <ShopItemModal
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          selectedItem={{
            ...selectedItem,
            id: parseInt(selectedItem.item_code),
            name: selectedItem.item_name,
            buyLabel: String(selectedItem.item_price),
            owned: ownedItems[selectedItem.item_code] || 0,
            image: selectedItem.item_picture_url,
          }}
          quantity={quantity}
          handleIncrement={handleIncrement}
          handleDecrement={handleDecrement}
          handlePurchase={handlePurchase}
          userCoins={userCoins}
        />
      )}
    </PageTransition>
  );
};

export default Shop;
