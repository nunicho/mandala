import { PROMOTIONS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const promotionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query({
      query: () => ({
        url: PROMOTIONS_URL,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Promotions"],
    }),
    getPromotionDetail: builder.query({
      query: (promotionId) => ({
        url: `${PROMOTIONS_URL}/${promotionId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createPromotion: builder.mutation({
      query: (promotion) => ({
        url: PROMOTIONS_URL,
        method: "POST",
        body: promotion,
      }),
      invalidatesTags: ["Promotions"],
    }),
    updatePromotion: builder.mutation({
      query: ({
        promotionId,
        name,
        description, // Incluye description aquí
        discountPercentage,
        duration, // Incluye duration aquí
      }) => ({
        url: `${PROMOTIONS_URL}/${promotionId}`,
        method: "PUT",
        body: { name, description, discountPercentage, duration }, // Incluye description y duration
      }),
      invalidatesTags: ["Promotions"],
    }),
    deletePromotion: builder.mutation({
      query: (promotionId) => ({
        url: `${PROMOTIONS_URL}/${promotionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Promotions"],
    }),
    togglePromotion: builder.mutation({
      query: ({ promotionId }) => ({
        url: `${PROMOTIONS_URL}/${promotionId}/togglePromotion`,
        method: "PUT",
      }),
      invalidatesTags: ["Promotions"],
    }),
    addProductPromotion: builder.mutation({
      query: ({ promotionId, productId }) => ({
        url: `${PROMOTIONS_URL}/${promotionId}/addProduct`,
        method: "PUT",
        body: { productId },
      }),
      invalidatesTags: ["Promotions"],
    }),
    removeProductPromotion: builder.mutation({
      query: ({ promotionId, productId }) => ({
        url: `${PROMOTIONS_URL}/${promotionId}/removeProduct`,
        method: "PUT",
        body: { productId },
      }),
      invalidatesTags: ["Promotions"],
    }),
  }),
});

export const {
  useGetPromotionsQuery,
  useGetPromotionDetailQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useTogglePromotionMutation,
  useAddProductPromotionMutation,
  useRemoveProductPromotionMutation,
} = promotionsApiSlice;
