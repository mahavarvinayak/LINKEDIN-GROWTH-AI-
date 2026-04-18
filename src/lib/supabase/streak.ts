import { SupabaseClient } from "@supabase/supabase-js";
import { format, differenceInDays, parseISO } from "date-fns";

/**
 * Updates the user's writing streak based on a new tool activity (analyze or generate).
 * Logic:
 * - If last activity was today: no change to streak count.
 * - If last activity was yesterday: increment streak count.
 * - If last activity was more than 1 day ago: reset streak to 1.
 *
 * Note:
 * - `last_posted_at` column name is retained for compatibility.
 * - Semantically it means "last day the user was active in this tool".
 */
export async function updateUserStreak(supabase: SupabaseClient, userId: string) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("streak_count, last_posted_at")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      console.error("Error fetching user for streak update:", fetchError);
      return;
    }

    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    let newStreak = user.streak_count || 0;

    if (!user.last_posted_at) {
      // First time activity
      newStreak = 1;
    } else {
      try {
        const lastDate = parseISO(user.last_posted_at);
        const diff = differenceInDays(today, lastDate);

        if (diff === 0) {
          // Already active today, don't increment but ensured it's at least 1
          if (newStreak === 0) newStreak = 1;
        } else if (diff === 1) {
          // Consecutive day!
          newStreak += 1;
        } else {
          // Gap detected, reset
          newStreak = 1;
        }
      } catch (parseError) {
        // If date parsing fails, reset streak to 1
        console.error("Error parsing last_posted_at date:", parseError);
        newStreak = 1;
      }
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        streak_count: newStreak,
        last_posted_at: todayStr,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user streak:", updateError);
    }

    return newStreak;
  } catch (err) {
    console.error("Critical error in updateUserStreak:", err);
  }
}
