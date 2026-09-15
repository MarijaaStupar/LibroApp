import { COLORS, FONTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const YEARS = [2026, 2025, 2024, 2023, 2022];

const STATS = [
  { label: "Books", value: "18" },
  { label: "Pages", value: "5,482" },
  { label: "Reading time", value: "73h" },
  { label: "Longest\nstreak", value: "12" },
];

const MONTHS = [
  { label: "J", value: 22 },
  { label: "F", value: 12 },
  { label: "M", value: 58 },
  { label: "A", value: 64 },
  { label: "M", value: 36 },
  { label: "J", value: 18 },
  { label: "J", value: 78 },
  { label: "A", value: 14 },
  { label: "S", value: 38 },
  { label: "O", value: 58 },
  { label: "N", value: 26 },
  { label: "D", value: 70 },
];
const CHART_MAX_HEIGHT = 60;

const HIGHLIGHTS = [
  { label: "Longest book", value: "609", suffix: "pages", featured: false },
  { label: "Average rating", value: "4,6", suffix: "star", featured: true },
  { label: "Best month", value: "July", suffix: "4 books", featured: false },
];

const GENRES = [
  { label: "Fantasy", percent: 38 },
  { label: "Romance", percent: 24 },
  { label: "Contemporary", percent: 17 },
  { label: "Thriller", percent: 12 },
  { label: "Historical", percent: 9 },
];

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const [year, setYear] = useState(YEARS[0]);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

  return (
    <View
      style={[
        styles.safe,
        { paddingTop: insets.top + 6, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.title}>My Reading Year</Text>

      <View style={styles.yearWrap}>
        <Pressable
          style={styles.yearPill}
          onPress={() => setYearMenuOpen((v) => !v)}
        >
          <Text style={styles.yearText}>{year}</Text>
          <Ionicons
            name={yearMenuOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color={COLORS.textSecondary}
          />
        </Pressable>

        {yearMenuOpen && (
          <View style={styles.yearDropdown}>
            {YEARS.map((y) => (
              <Pressable
                key={y}
                style={styles.yearOption}
                onPress={() => {
                  setYear(y);
                  setYearMenuOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.yearOptionText,
                    y === year && styles.yearOptionTextActive,
                  ]}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statBox}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartWrap}>
        <View style={styles.chartGrid} pointerEvents="none">
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
        </View>
        <View style={styles.chartBars}>
          {MONTHS.map((month, i) => (
            <View
              key={`${month.label}-${i}`}
              style={[
                styles.chartBar,
                { height: (month.value / 100) * CHART_MAX_HEIGHT },
              ]}
            />
          ))}
        </View>
        <View style={styles.chartLabels}>
          {MONTHS.map((month, i) => (
            <Text key={`${month.label}-lbl-${i}`} style={styles.chartLabel}>
              {month.label}
            </Text>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your reading highlights</Text>
      <View style={styles.highlightsRow}>
        {HIGHLIGHTS.map((h) => (
          <View
            key={h.label}
            style={[
              styles.highlightBox,
              h.featured && styles.highlightFeatured,
            ]}
          >
            <Text style={styles.highlightLabel}>{h.label}</Text>
            {h.suffix === "star" ? (
              <View style={styles.ratingRow}>
                <Text style={styles.highlightValue}>{h.value}</Text>
                <Ionicons name="star" size={15} color={COLORS.rating} />
              </View>
            ) : (
              <>
                <Text style={styles.highlightValue}>{h.value}</Text>
                <Text style={styles.highlightSuffix}>{h.suffix}</Text>
              </>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Favorite genres</Text>
      <View style={styles.genresList}>
        {GENRES.map((genre) => (
          <View key={genre.label} style={styles.genreRow}>
            <Text style={styles.genreLabel}>{genre.label}</Text>
            <View style={styles.genreTrack}>
              <View
                style={[styles.genreFill, { width: `${genre.percent}%` }]}
              />
            </View>
            <Text style={styles.genrePercent}>{genre.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 40,
    color: COLORS.textMain,
    marginBottom: 10,
  },
  yearWrap: {
    alignItems: "center",
    marginBottom: 14,
    zIndex: 50,
  },
  yearPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  yearText: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 15,
    color: COLORS.textMain,
  },
  yearDropdown: {
    position: "absolute",
    top: 36,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 4,
    width: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  yearOption: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
  },
  yearOptionText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  yearOptionTextActive: {
    fontFamily: FONTS.serifSemiBold,
    color: COLORS.textMain,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  statValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    color: COLORS.textMain,
  },
  statLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 3,
  },
  chartWrap: {
    marginBottom: 18,
  },
  chartGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CHART_MAX_HEIGHT,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: CHART_MAX_HEIGHT,
  },
  chartBar: {
    width: 14,
    borderRadius: 4,
    backgroundColor: COLORS.primaryPink,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chartLabel: {
    width: 14,
    textAlign: "center",
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    color: COLORS.textMain,
    marginBottom: 10,
  },
  highlightsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  highlightBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  highlightFeatured: {
    backgroundColor: COLORS.lightPink,
  },
  highlightLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 6,
  },
  highlightValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    color: COLORS.textMain,
  },
  highlightSuffix: {
    fontFamily: FONTS.sansRegular,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  genresList: {
    flex: 1,
  },
  genreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  genreLabel: {
    width: 92,
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textMain,
  },
  genreTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.progressTrack,
    overflow: "hidden",
    marginRight: 10,
  },
  genreFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.primaryPink,
  },
  genrePercent: {
    width: 32,
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "right",
  },
});
