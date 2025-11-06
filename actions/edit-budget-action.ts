"use server";

import getToken from "@/src/auth/token";
import { Budget, DraftBudgetSchema, SuccessSchema } from "@/src/schemas";
import { revalidatePath } from "next/cache";
import { json, success } from "zod";

type ActionStateType = {
  errors: string[];
  success: string;
};

export async function editBudget(
  budgetId: Budget["id"],
  prevState: ActionStateType,
  formData: FormData
) {
  const budgetData = {
    name: formData.get("name"),
    amount: formData.get("amount"),
  };

  const budget = DraftBudgetSchema.safeParse(budgetData);
  if (!budget.success) {
    return {
      errors: budget.error.issues.map((issue) => issue.message),
      success: "",
    };
  }

  const token = getToken();
  const url = `${process.env.API_URL}/budgets/${budgetId}`;
  const req = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: budget.data.name,
      amount: budget.data.amount,
    }),
  });

  revalidatePath("/admin");

  const success = SuccessSchema.parse(json);

  return {
    errors: [],
    success,
  };
}
