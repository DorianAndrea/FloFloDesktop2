export const showUnlockedAchievements = (showFeedback, unlockedAchievements = []) => {
  if (!Array.isArray(unlockedAchievements) || unlockedAchievements.length === 0) {
    return;
  }

  unlockedAchievements.forEach((achievement, index) => {
    setTimeout(() => {
      showFeedback({
        type: "success",
        icon: achievement.icon || "🏆",
        label: "Logro desbloqueado",
        title: `¡${achievement.name || "Nuevo logro"}!`,
        message:
          achievement.description ||
          "Has desbloqueado un nuevo logro en FloFlo.",
      });
    }, index * 700);
  });
};