#!/bin/bash
# Test script for generating random events between characters
# Usage: ./scripts/test_random_event.sh

set -e

CHARACTERS_DIR="data/characters"
EVENTS_DIR="data/events"

# Event types
EVENT_TYPES=("argument" "fight" "stealing" "romance" "trade" "gossip" "help" "celebration" "confrontation" "reconciliation")

# Character moods
MOODS=("angry" "scared" "in_love" "happy" "sad" "nervous" "confident" "suspicious" "grateful" "jealous" "neutral")

# Locations
LOCATIONS=(
    "the village square"
    "the tavern"
    "the blacksmith's forge"
    "the market stalls"
    "the village well"
    "the herbalist's garden"
    "the mill"
    "the bridge over the creek"
    "the temple steps"
    "the farmer's field"
)

# Event descriptions by type
declare -A DESCRIPTIONS
DESCRIPTIONS["argument"]="A heated disagreement over borrowed tools|A dispute about property boundaries|An argument about unpaid debts|A quarrel over a broken promise"
DESCRIPTIONS["fight"]="A brawl that breaks out after harsh words|A physical confrontation over honor|A scuffle that escalates quickly"
DESCRIPTIONS["stealing"]="A theft attempt gone wrong|Caught red-handed taking supplies|A misunderstanding about ownership"
DESCRIPTIONS["romance"]="A chance encounter that sparks interest|A nervous confession of feelings|A moonlit meeting by the well"
DESCRIPTIONS["trade"]="Negotiating the price of goods|A barter gone sideways|Haggling over rare materials"
DESCRIPTIONS["gossip"]="Sharing rumors about the new arrival|Whispering about strange happenings|Trading village secrets"
DESCRIPTIONS["help"]="Offering assistance with a heavy load|Coming to aid during a crisis|Sharing expertise with a struggling neighbor"
DESCRIPTIONS["celebration"]="Toasting at the harvest festival|Dancing at the village gathering|Celebrating a successful trade"
DESCRIPTIONS["confrontation"]="A tense standoff over past grievances|Demanding answers about suspicious behavior|Calling out dishonest dealings"
DESCRIPTIONS["reconciliation"]="Making amends after a long feud|Apologizing for past mistakes|Rebuilding a broken friendship"

# Helper function to pick random element from array
pick_random() {
    local arr=("$@")
    echo "${arr[$RANDOM % ${#arr[@]}]}"
}

# Helper function to pick random description for event type
pick_description() {
    local event_type="$1"
    local descriptions="${DESCRIPTIONS[$event_type]}"
    IFS='|' read -ra desc_arr <<< "$descriptions"
    pick_random "${desc_arr[@]}"
}

# Check if characters exist
character_files=($(ls "$CHARACTERS_DIR"/*.json 2>/dev/null || true))

if [ ${#character_files[@]} -lt 2 ]; then
    echo "❌ Error: Need at least 2 characters in $CHARACTERS_DIR"
    echo "Generate characters first with:"
    echo "  uv run python scripts/test_character_init.py"
    echo "  uv run python scripts/test_character_init.py -d 'a grumpy blacksmith'"
    exit 1
fi

echo "🎭 Random Event Generator Test"
echo "==============================="
echo ""

# Pick two random different characters
char_a_idx=$((RANDOM % ${#character_files[@]}))
char_b_idx=$((RANDOM % ${#character_files[@]}))
while [ $char_a_idx -eq $char_b_idx ]; do
    char_b_idx=$((RANDOM % ${#character_files[@]}))
done

CHAR_A="${character_files[$char_a_idx]}"
CHAR_B="${character_files[$char_b_idx]}"

# Pick random event parameters
EVENT_TYPE=$(pick_random "${EVENT_TYPES[@]}")
MOOD_A=$(pick_random "${MOODS[@]}")
MOOD_B=$(pick_random "${MOODS[@]}")
TARGET_MOOD_A=$(pick_random "${MOODS[@]}")
TARGET_MOOD_B=$(pick_random "${MOODS[@]}")
LOCATION=$(pick_random "${LOCATIONS[@]}")
DESCRIPTION=$(pick_description "$EVENT_TYPE")

# Random interaction counts (min 2-4, max 4-8)
MIN_INTERACTIONS=$((2 + RANDOM % 3))
MAX_INTERACTIONS=$((MIN_INTERACTIONS + 2 + RANDOM % 3))

echo "📋 Event Configuration:"
echo "  Character A: $(basename "$CHAR_A")"
echo "  Character B: $(basename "$CHAR_B")"
echo "  Event Type:  $EVENT_TYPE"
echo "  Location:    $LOCATION"
echo "  Description: $DESCRIPTION"
echo "  Mood A:      $MOOD_A → $TARGET_MOOD_A"
echo "  Mood B:      $MOOD_B → $TARGET_MOOD_B"
echo "  Interactions: $MIN_INTERACTIONS - $MAX_INTERACTIONS"
echo ""

# Run the event generator
echo "🚀 Generating event..."
echo ""

uv run python scripts/test_event_generator.py generate \
    --char-a "$CHAR_A" \
    --char-b "$CHAR_B" \
    --type "$EVENT_TYPE" \
    --description "$DESCRIPTION" \
    --location "$LOCATION" \
    --mood-a "$MOOD_A" \
    --mood-b "$MOOD_B" \
    --target-a "$TARGET_MOOD_A" \
    --target-b "$TARGET_MOOD_B" \
    --min "$MIN_INTERACTIONS" \
    --max "$MAX_INTERACTIONS" \
    --language "spanish"

echo ""
echo "✅ Test completed!"
echo "Events saved in: $EVENTS_DIR/"
