# A recreation of Geometry Dash for Numworks calculators.
# Credits: Calm_Repeat_7267 and wperez274

from random import choice
from time import monotonic
try:
    #raise  # Try the original kandinsky emulator
    from emulator import fill_rect, draw_string, update, sleep
    emulated = True
except:
    emulated = False
    from kandinsky import fill_rect, draw_string   # Comment these lines before compiling to .exe
    from time import sleep                         # Comment these lines before compiling to .exe

from ion import (
    KEY_OK, KEY_EXE, KEY_UP,
    KEY_LEFT, KEY_RIGHT, KEY_BACKSPACE,
    KEY_SHIFT, keydown
)


levels = [
    [  # Level 1
        [
            [0, 6, 32, 1], [48, 4, 23, 1], [35, 5, 36, 1], [32, 6, 77, 1], [104, 5, 5, 1], [79, 5, 14, 1]
        ],
        [
            [20, 6, 0], [36, 5, 0], [59, 4, 0], [61, 4, 0], [80, 5, 0], [92, 5, 0], [103, 6, 0]
        ],
        109, (0, 190, 190), (0, 30, 30), "Gild Madness", 0, 0, "wperez274", [[13, 5]]
    ],
    [  # Level 2
        [
            [0, 6, 32,1], [28, 5, 26, 1], [42, 4, 12, 1], [62, 5, 24, 1], [82, 4, 4, 1], [94, 6, 108, 1], [94, 5, 42, 1], [94, 4, 38, 1], [118, 3, 14, 1], [138, 3, 8, 1], [142, 2, 24, 1], [174, 5, 14, 1], [206, 6, 4, 1], [216, 6, 20, 1], [240, 5, 10, 1], [254, 4, 8, 1], [266, 3, 6, 1], [32, 6, 54, 1]
        ],
        [
            [35, 5, 0], [50, 4, 0], [63, 5, 0], [73, 5, 0], [104, 4, 0], [106, 4, 0], [124, 3, 0], [126, 3, 0], [149, 2, 0], [150, 6, 0], [151, 2, 0], [156, 6, 0], [157, 2, 0], [158, 6, 0], [159, 2, 0], [181, 5, 0], [195, 6, 0], [224, 6, 0], [226, 6, 0], [244, 5, 0]
        ],
        272, (0, 250, 80), (0, 70, 70), "Back in Green", 0, 0, "wperez274", []
    ],
    [  # Level 3
        [
            [0, 6, 32, 1], [32, 5, 58, 2], [90, 4, 30, 3], [108, 3, 12, 1], [120, 6, 74, 1], [128, 3, 8, 1], [132, 2, 22, 1], [150, 1, 26, 1], [162, 5, 32, 1], [172, 2, 20, 1], [202, 5, 42, 2], [248, 4, 4, 3], [254, 5, 4, 2], [260, 6, 16, 1]
        ],
        [
            [42, 5, 0], [52, 5, 0], [62, 5, 0], [73, 5, 0], [82, 5, 0], [133, 4, 1], [142, 2, 0], [144, 6, 0], [146, 6, 0], [151, 1, 0], [153, 3, 1], [158, 2, 1], [160, 6, 0], [164, 1, 0], [166, 5, 0], [176, 3, 1], [218, 5, 0], [220, 5, 0], [230, 5, 0], [240, 5, 0], [268, 6, 0]
        ],
        276, (0, 130, 240), (0, 0, 70), "Polablue", 0, 0, "wperez274", []
    ],
    [  # Level 4
        [
            [0, 6, 32, 1], [172, 6, 42, 1], [110, 6, 24, 1], [66, 4, 32, 1], [56, 5, 46, 2], [52, 5, 2, 2], [32, 5, 18, 2], [120, 5, 4, 1], [120, 3, 4, 1], [140, 5, 4, 2], [148, 4, 4, 3], [154, 3, 4, 4], [160, 4, 4, 3], [166, 5, 4, 2], [220, 6, 52, 1], [248, 5, 24, 1], [258, 4, 14, 1]
        ],
        [
            [41, 5, 0], [53, 5, 0], [74, 4, 0], [83, 4, 0], [92, 4, 0], [121, 3, 0], [123, 3, 0], [167, 5, 0], [169, 5, 0], [184, 6, 0], [186, 6, 0], [194, 6, 0], [202, 6, 0], [204, 6, 0], [217, 6, 1], [217, 6, 0], [230, 6, 0], [239, 6, 0], [249, 5, 0], [259, 4, 0]
        ],
        272, (180, 0, 0), (50, 0, 0), "Dry Red", 0, 0, "wperez274", []
    ]
]

random_sentences = [
    "brih", "yea", "wiw", "loll", "wot", "wha", "xd",
    "This is a serious question", "Don't hack like uranium",
    "Ty Roxy for playtesting", "Ty Minh for playtesting",
    "Ty Ihv2010 for support", "Subscribe to Gild56 on YT"
]


TICK = 1/30  # 30 FPS
speed = 6  # pixels / frame
RESPAWN_TIME = 1

percentage = 0
menu_button = 2
max_menu_buttons = 3
menu = "main"
attempts = 0
percentage_label = ""
current_level = 0

start_wait = None


# Anti-hold variables

clicked = False


# Physics

player_x = 50
player_y = 172

map_offset_x = 0

can_jump = True

is_jumping = False
is_falling = False

jump_velocity = 32
air_ticks = 0

ORB_SIDE = 20
took_pad = False


# Sizes

SCREEN_WIDTH = 320
SCREEN_HEIGHT = 222
TILE_SIZE_X = 10

CHARECTER_WIDTH = 10
CHARACTER_HEIGHT = 18
CHARACTERS_LIMIT = SCREEN_WIDTH / CHARECTER_WIDTH

PLAYER_WIDTH = 20
PLAYER_HEIGHT = 20


# Colors

bg_color = (0, 0, 0)
player_color = (255, 255, 0)
blocks_color = (0, 0, 0)

MAIN_MENU_COLOR = (0, 60, 255)
GARAGE_MENU_COLOR = (131, 63, 0)

DARK_GREEN = (0, 150, 0)
DARK_BLUE = (0, 0, 150)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)

YELLOW = (255, 255, 0)
PINK = (255, 150, 150)
PURPLE = (255, 0, 255)
BLUE = (0, 0, 255)
GREY = (170, 170, 170)

color_chosen = 1

colors = [
    ["yellow", True, YELLOW, "Default color"],
    ["blue", False, BLUE, "Complete \"" + levels[0][5] + "\""],
    ["green", False, GREEN, "Complete \"" + levels[1][5] + "\""],
    ["purple", False, PURPLE, "Complete \"" + levels[2][5] + "\""],
    ["pink", False, PINK, "Complete \"" + levels[3][5] + "\""],
    #["white", False, WHITE, "Complete every level with coins"]
]  # add brown, grey, black..?


# Drawing level

def get_visible_tile_range():
    first_tile = (-map_offset_x) // TILE_SIZE_X - 2
    last_tile = first_tile + (SCREEN_WIDTH // TILE_SIZE_X) + 4
    return first_tile, last_tile

def draw_player(color: tuple[int, int, int] | None = None):
    global PLAYER_WIDTH, PLAYER_HEIGHT, player_color
    if color:
        fill_rect(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT, color)
    else:
        fill_rect(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT, player_color)

def draw_spike(x_tile: int, y_tile: int, orientation: int):
    for i in range(5):
        fill_rect(
            map_offset_x + x_tile * 10 - 10 + i * 2,
            y_tile * 32 - i * 4 + (2 * i * 4 * orientation) - 4 * (1 - orientation),
            20 - i * 4, 4, blocks_color
        )
        fill_rect(
            map_offset_x + x_tile * 10 + 10 - i * 2,
            y_tile * 32 - i * 4 + (2 * i * 4 * orientation) - 4 * (1 - orientation),
            speed, 4, bg_color
        )

def draw_platform(x_tile: int, y_tile: int, width_tiles: int, height_tiles: int):
    fill_rect(
        map_offset_x + x_tile * 10, y_tile * 32,
        10 * width_tiles, height_tiles * 32, blocks_color
    )

    if width_tiles < 0:
        fill_rect(map_offset_x + x_tile * 10, y_tile * 32, 6, height_tiles * 32, bg_color)
    else:
        fill_rect(
            map_offset_x + x_tile * 10 + width_tiles * 10, y_tile * 32,
            speed, height_tiles * 32, bg_color
        )

def draw_pad(x_tile: int, y_tile: int):
    fill_rect(
        round(map_offset_x + (x_tile + 0.2) * 10), round((y_tile + 0.7) * 32),
        ORB_SIDE, ORB_SIDE // 2, YELLOW
    )
    fill_rect(
        map_offset_x + x_tile * 10 + ORB_SIDE, round((y_tile + 0.7) * 32),
        speed, ORB_SIDE // 2, bg_color
    )

def draw_level():
    global attempts, percentage_label, percentage
    first_tile, last_tile = get_visible_tile_range()

    # Spikes
    for x, y, orientation in levels[current_level][1]:
        if first_tile <= x <= last_tile:
            draw_spike(x, y, orientation)

    # Platforms
    for x, y, w, h in levels[current_level][0]:
        if x + w >= first_tile and x <= last_tile:
            draw_platform(x, y, w, h)

    # Pads
    for x, y in levels[current_level][9]:
        if x + 10 >= first_tile and x <= last_tile:
            draw_pad(x, y)

    # Endwall
    end_x = levels[current_level][2]
    if first_tile <= end_x <= last_tile:
        fill_rect(map_offset_x + end_x * 10, 0, 10, SCREEN_HEIGHT, GREEN)
        fill_rect(map_offset_x + end_x * 10 + 10, 0, 6, SCREEN_HEIGHT, bg_color)

    # Labels
    attempts = levels[current_level][7]
    attempts_label = str(attempts)

    if attempts < 100:
        attempts_label = "0" + attempts_label
        if attempts < 10:
            attempts_label = "0" + attempts_label


    percentage = round(  # Full Distance / Payer Position * 100
        (
            ((levels[current_level][2] * 10) - (levels[current_level][2] * 10 + map_offset_x))
            / (levels[current_level][2] * 10 - (player_x + PLAYER_WIDTH))
            * 100
        ), 2
    )

    if percentage > 100:
        percentage = 100.0

    percentage_label = "{:.2f}".format(percentage)

    if percentage < 10:
        percentage_label = "0" + percentage_label

    if len(percentage_label) < 5:
        percentage_label += "0"

    draw_string(" " + levels[current_level][5] + " ", 0, 0, bg_color, BLACK)
    draw_string(" Attempts:" + attempts_label + " ", 180, 0, RED, BLACK)
    draw_centered_string(percentage_label + "%", 20, BLACK, bg_color)

    # For testing: shows screen min and max on the x axis
    #draw_string(str(first_tile) + " to " + str(last_tile), 0, 20, BLACK, bg_color)


# Physics

def check_collision():
    player_tile = (-map_offset_x + player_x) // 10
    first_tile = player_tile - 2
    last_tile = player_tile + 2

    # Platforms
    for x, y, w, h in levels[current_level][0]:
        if x > last_tile or x + w < first_tile:
            continue

        rx = x * 10 + map_offset_x
        ry = y * 32
        rw = w * 10
        rh = h * 32

        if (
            player_x + PLAYER_WIDTH  > rx and player_x < rx + rw and
            player_y + PLAYER_HEIGHT > ry and player_y < ry + rh
        ):
            return True

    # Spikes
    for x, y, orientation in levels[current_level][1]:
        if x < first_tile or x > last_tile:
            continue

        rx = x * 10 + map_offset_x
        ry = y * 32

        if orientation == 0:  # regular spike
            hit_y1 = ry - 16
            hit_y2 = ry
        else:  # upside down spike
            hit_y1 = ry
            hit_y2 = ry + 16

        if (
            player_x + PLAYER_WIDTH  > rx and player_x < rx + 10 and
            player_y + PLAYER_HEIGHT > hit_y1 and player_y < hit_y2
        ):
            return True

    return False

def check_pad_collision():
    player_tile = (-map_offset_x + player_x) // 10
    first_tile = player_tile - 2
    last_tile = player_tile + 2
    for x, y in levels[current_level][9]:
        if x < first_tile or x > last_tile:
            continue

        rx = x * 10 + map_offset_x
        ry = y * 32

        hit_y1 = ry - 16
        hit_y2 = ry + 16

        if (
            player_x + PLAYER_WIDTH  > rx and player_x < rx + 10 and
            player_y + PLAYER_HEIGHT > hit_y1 and player_y < hit_y2
        ):
            return True

def respawn():
    global current_level, map_offset_x, player_y, bg_color
    global menu, bg_color, player_color, blocks_color, start_wait

    levels[current_level][7] += 1

    menu = "level"
    start_wait = None

    bg_color = levels[current_level][3]
    blocks_color = levels[current_level][4]
    fill_screen(bg_color)

    map_offset_x = 0
    player_y = 172

    draw_level()
    draw_player()


# Improved Kadinsky functions

def fill_screen(color: tuple[int, int, int]):
    fill_rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, color)

def draw_centered_string(
        text: str,
        y: int,
        color: tuple[int, int, int],
        background: tuple[int, int, int]
    ):
    global SCREEN_WIDTH

    if len(text) > CHARACTERS_LIMIT:
        print(
            "WARNING: The string \""+ text +
            "\" is too long! " + str(CHARACTERS_LIMIT) + " characters maximum)"
        )

    x = round((SCREEN_WIDTH - len(text) * 10) / 2)
    draw_string(text, x, y, color, background)


# Pages functions

def if_clicked():
    if (
        keydown(KEY_EXE) or
        keydown(KEY_OK) or
        keydown(KEY_SHIFT) or
        keydown(KEY_BACKSPACE) or
        keydown(KEY_LEFT) or
        keydown(KEY_RIGHT)
    ):
        return True
    return False


def enter_endscreen():
    global menu
    menu = "endscreen"
    draw_endscreen()

def draw_endscreen():
    fill_screen(blocks_color)
    MARGIN = 30
    fill_rect(MARGIN, MARGIN, SCREEN_WIDTH - MARGIN * 2, SCREEN_HEIGHT - MARGIN * 2, bg_color)
    draw_centered_string("LEVEL COMPLETED", 60, DARK_GREEN, bg_color)
    draw_centered_string("Attempts: " + str(attempts), 100, BLACK, bg_color)
    draw_centered_string(choice(random_sentences), 140, BLACK, bg_color)


def enter_main_menu():
    global menu, menu_button, max_menu_buttons

    menu = "main"
    max_menu_buttons = 3
    menu_button = 2

    fill_screen(MAIN_MENU_COLOR)
    draw_main_menu()

def draw_main_menu():
    # Big button if chosen
    if menu_button == 2:
        chosen_color = WHITE
    else:
        chosen_color = MAIN_MENU_COLOR

    CHOSEN_BIG_BUTTON_SIDE = 90
    fill_rect(
        round((SCREEN_WIDTH - CHOSEN_BIG_BUTTON_SIDE) / 2),
        round((SCREEN_HEIGHT - CHOSEN_BIG_BUTTON_SIDE) / 2),
        CHOSEN_BIG_BUTTON_SIDE,
        CHOSEN_BIG_BUTTON_SIDE,
        chosen_color
    )

    # Big button in the center
    BIG_BUTTON_SIDE = 70
    BIG_BUTTON_X_MARGIN = (SCREEN_WIDTH - BIG_BUTTON_SIDE) / 2
    BIG_BUTTON_Y_MARGIN = (SCREEN_HEIGHT - BIG_BUTTON_SIDE) / 2
    fill_rect(
        round(BIG_BUTTON_X_MARGIN),
        round(BIG_BUTTON_Y_MARGIN),
        BIG_BUTTON_SIDE,
        BIG_BUTTON_SIDE,
        GREEN
    )

    # Play triangle inside the big button
    PIXELS_X = 5
    PIXEL_WIDTH = BIG_BUTTON_SIDE / (PIXELS_X + 2)
    MAX_HEIGHT = PIXELS_X * PIXEL_WIDTH
    TOTAL_MINI_PIXELS = (PIXELS_X * 2 - 1)
    MINI_PIXEL = MAX_HEIGHT / TOTAL_MINI_PIXELS
    current_pixels = TOTAL_MINI_PIXELS

    for i in range(PIXELS_X):
        fill_rect(
            round(BIG_BUTTON_X_MARGIN + PIXEL_WIDTH * (i + 1)),
            round(BIG_BUTTON_Y_MARGIN + PIXEL_WIDTH + MINI_PIXEL * i),
            round(PIXEL_WIDTH),
            round(current_pixels * MINI_PIXEL),
            YELLOW
        )
        current_pixels -= 2

    # Small left button if chosen
    if menu_button == 1:
        chosen_color = WHITE
    else:
        chosen_color = MAIN_MENU_COLOR

    CHOSEN_SMALL_BUTTON_SIDE = 70
    CHOSEN_SMALL_BUTTON_Y_MARGIN = round(
        (SCREEN_HEIGHT - CHOSEN_SMALL_BUTTON_SIDE) / 2
    )
    fill_rect(
        round((BIG_BUTTON_X_MARGIN - CHOSEN_SMALL_BUTTON_SIDE) / 2),
        CHOSEN_SMALL_BUTTON_Y_MARGIN,
        CHOSEN_SMALL_BUTTON_SIDE,
        CHOSEN_SMALL_BUTTON_SIDE,
        chosen_color
    )

    # Small left button
    SMALL_BUTTON_SIDE = 50
    SMALL_BUTTON_Y_MARGIN = round(
        (SCREEN_HEIGHT - SMALL_BUTTON_SIDE) / 2
    )
    fill_rect(
        round((BIG_BUTTON_X_MARGIN - SMALL_BUTTON_SIDE) / 2),
        SMALL_BUTTON_Y_MARGIN,
        SMALL_BUTTON_SIDE,
        SMALL_BUTTON_SIDE,
        GREEN
    )

    # Icon inside the left button
    CUBE_ICON_SIDE = 30
    CUBE_ICON_X_MARGIN = round(
        (BIG_BUTTON_X_MARGIN - CUBE_ICON_SIDE) / 2
    )
    CUBE_ICON_Y_MARGIN = round(
        (SCREEN_HEIGHT - CUBE_ICON_SIDE) / 2
    )
    fill_rect(
        CUBE_ICON_X_MARGIN,
        CUBE_ICON_Y_MARGIN,
        CUBE_ICON_SIDE,
        CUBE_ICON_SIDE,
        YELLOW
    )

    # Small right button if chosen
    if menu_button == 3:
        chosen_color = WHITE
    else:
        chosen_color = MAIN_MENU_COLOR

    CHOSEN_RIGHT_SMALL_BUTTON_X_MARGIN = round(
        (BIG_BUTTON_X_MARGIN - CHOSEN_SMALL_BUTTON_SIDE) / 2
        + BIG_BUTTON_SIDE + BIG_BUTTON_X_MARGIN
    )

    fill_rect(
        CHOSEN_RIGHT_SMALL_BUTTON_X_MARGIN,
        CHOSEN_SMALL_BUTTON_Y_MARGIN,
        CHOSEN_SMALL_BUTTON_SIDE,
        CHOSEN_SMALL_BUTTON_SIDE,
        chosen_color
    )

    # Small right button
    RIGHT_SMALL_BUTTON_X_MARGIN = round(
        (BIG_BUTTON_X_MARGIN - SMALL_BUTTON_SIDE) / 2
        + BIG_BUTTON_SIDE + BIG_BUTTON_X_MARGIN
    )

    fill_rect(
        RIGHT_SMALL_BUTTON_X_MARGIN,
        SMALL_BUTTON_Y_MARGIN,
        SMALL_BUTTON_SIDE,
        SMALL_BUTTON_SIDE,
        GREEN
    )

    # Platformer controls button on the small right button

    CONTROLS_MARGIN = 5
    CONTROLS_X = RIGHT_SMALL_BUTTON_X_MARGIN + CONTROLS_MARGIN
    CONTROLS_Y = SMALL_BUTTON_Y_MARGIN + CONTROLS_MARGIN
    CONTROLS_SIDE = SMALL_BUTTON_SIDE - (CONTROLS_MARGIN * 2)
    CONTROL_MAP_Y = [1, 2, 3, 0, 3, 2, 1]  # Height of every column of the pixel art
    CONTROLS_PIXELS_X = len(CONTROL_MAP_Y)
    CONTROLS_MAX_PIXELS_Y = max(CONTROL_MAP_Y)
    CONTROLS_PIXEL_SIZE_Y = CONTROLS_SIDE / CONTROLS_MAX_PIXELS_Y
    CONTROLS_PIXEL_SIZE_X = CONTROLS_SIDE / CONTROLS_PIXELS_X

    for i in range(CONTROLS_PIXELS_X):
        current_height = CONTROLS_PIXEL_SIZE_Y * CONTROL_MAP_Y[i]
        fill_rect(
            round(CONTROLS_X + CONTROLS_PIXEL_SIZE_X * i),
            round(CONTROLS_Y + ((CONTROLS_SIDE - current_height) / 2)),
            round(CONTROLS_PIXEL_SIZE_X),
            round(current_height),
            YELLOW
        )

    # Text

    draw_centered_string("GEOMETRY WORKS", 20, WHITE, MAIN_MENU_COLOR)

    draw_centered_string("Up/OK=Jump | Shift=Restart", 170, WHITE, MAIN_MENU_COLOR)
    draw_centered_string("OK/EXE=Choose | Backspace=Exit", 190, WHITE, MAIN_MENU_COLOR)


def enter_browse_levels_menu():
    global menu, menu_button, max_menu_buttons
    menu_button = current_level + 1
    max_menu_buttons = len(levels)
    menu = "browse_levels"
    draw_level_menu()

def draw_level_menu():
    completed_color = DARK_GREEN
    bg_color = levels[menu_button - 1][3]
    blocks_color = levels[menu_button - 1][4]
    best = levels[menu_button - 1][6]

    fill_screen(blocks_color)
    draw_centered_string(levels[menu_button - 1][5], 40, WHITE, blocks_color)
    draw_centered_string("by " + str(levels[menu_button - 1][8]), 70, bg_color, blocks_color)
    draw_centered_string("Attempts: " + str(levels[menu_button - 1][7]), 150, bg_color, blocks_color)

    # Progressbar
    MARGIN = 30
    Y_POSITION = 110

    LENGTH = SCREEN_WIDTH - (MARGIN * 2)
    fill_rect(MARGIN, Y_POSITION, LENGTH, CHARACTER_HEIGHT + 2, bg_color)

    COMPLETED_LENGTH = round(LENGTH / 100 * best)
    fill_rect(MARGIN, Y_POSITION, COMPLETED_LENGTH, CHARACTER_HEIGHT + 2, completed_color)

    if best > 50:
        bg_text_color = completed_color
        letters_color = WHITE
    else:
        bg_text_color = bg_color
        letters_color = blocks_color

    LITTLE_MARGIN = 10
    draw_string("<", LITTLE_MARGIN, Y_POSITION, WHITE, blocks_color)
    draw_string(">", SCREEN_WIDTH - LITTLE_MARGIN - CHARECTER_WIDTH, Y_POSITION, WHITE, blocks_color)

    draw_centered_string(str(round(best)) + "%", Y_POSITION, letters_color, bg_text_color)


def enter_garage_menu():
    global menu, menu_button, max_menu_buttons
    menu_button = 1
    max_menu_buttons = len(colors)
    menu = "garage"
    draw_garage_menu()

def draw_garage_menu():
    global player_color
    fill_screen(GARAGE_MENU_COLOR)
    draw_centered_string("You:", 20, WHITE, GARAGE_MENU_COLOR)
    draw_centered_string("Choose your color:", 110, WHITE, GARAGE_MENU_COLOR)
    if not colors[menu_button - 1][1]:
        draw_centered_string(colors[menu_button - 1][3], 180, WHITE, GARAGE_MENU_COLOR)
        draw_centered_string("to get this color", 200, WHITE, GARAGE_MENU_COLOR)

    CUBE_SIDE = 40
    CUBE_X_MARGIN = round((SCREEN_WIDTH - CUBE_SIDE) / 2)
    fill_rect(CUBE_X_MARGIN, 50, CUBE_SIDE, CUBE_SIDE, player_color)

    COLORS_COUNT = len(colors)
    COLOR_SIDE = 30
    X_MARGIN = 20
    X_SPACE = SCREEN_WIDTH - (X_MARGIN * 2) - COLOR_SIDE
    Y_MARGIN = 50


    # Color box when chosen

    CHOSEN_MARGIN = 5

    for i in range(COLORS_COUNT):
        if i + 1 == menu_button:
            fill_rect(
                round(X_MARGIN + (X_SPACE / (COLORS_COUNT - 1) * i)) - CHOSEN_MARGIN,
                SCREEN_HEIGHT - Y_MARGIN - COLOR_SIDE - CHOSEN_MARGIN,
                COLOR_SIDE + CHOSEN_MARGIN * 2,
                COLOR_SIDE + CHOSEN_MARGIN * 2,
                WHITE if colors[menu_button - 1][1] else GREY
            )


    # Regular color boxes

    for i in range(COLORS_COUNT):
        fill_rect(
            round(X_MARGIN + (X_SPACE / (COLORS_COUNT - 1) * i)),
            SCREEN_HEIGHT - Y_MARGIN - COLOR_SIDE,
            COLOR_SIDE, COLOR_SIDE, colors[i][2]
        )


enter_main_menu()


while True:  # Game loop
    start = monotonic()

    if menu == "level" and not start_wait:
        # Physics

        if not is_jumping:
            for i in range(len(levels[current_level][0])):
                if (
                    player_y + 20 == levels[current_level][0][i][1] * 32
                    and levels[current_level][0][i][0] * 10 + map_offset_x -19
                    <= 50 <=
                    levels[current_level][0][i][2] * 10 + levels[current_level][0][i][0] * 10 + map_offset_x
                ):
                    can_jump = True
                    is_falling = False
                    break
                else:
                    can_jump = False
                    is_falling = True

            if is_falling == True:
                draw_player(bg_color)
                player_y += 16

            if check_pad_collision():
                took_pad = True
                jump_velocity *= 2

            if (
                (keydown(KEY_OK) and can_jump == True) or
                (keydown(KEY_UP) and can_jump == True)
            ) or check_pad_collision():
                draw_player(bg_color)
                is_jumping = True
                player_y -= int(jump_velocity)
                jump_velocity = jump_velocity / 2

        elif can_jump:
            draw_player(bg_color)

            for i in range(len(levels[current_level][0])):
                if player_y + 20 != levels[current_level][0][i][1] * 32:
                    is_jumping = True
                elif (
                    levels[current_level][0][i][0] * 10 + map_offset_x-19
                    < 50
                    < levels[current_level][0][i][0] * 10 + map_offset_x + levels[current_level][0][i][2] * 10 + 20
                ):
                    is_jumping = False
                    jump_velocity = 32
                    break

            if is_jumping:
                player_y -= int(jump_velocity)
                if jump_velocity > 2:
                    jump_velocity = jump_velocity / 2
                elif jump_velocity == 2:
                    jump_velocity = 0
                elif jump_velocity == 0:
                    air_ticks += 1

                    if air_ticks == 4:
                        air_ticks = 0
                        jump_velocity = -2
                elif jump_velocity <= (-2) and jump_velocity > (-32):
                    jump_velocity=jump_velocity*2
                else:
                    is_jumping  = False
                    jump_velocity = 32
                    can_jump = True
            else:
                is_jumping  = False
                jump_velocity = 32

        if not (keydown(KEY_OK) or keydown(KEY_UP)):
            clicked = False


        # Drawing

        draw_player(player_color)

        map_offset_x -= speed
        draw_level()


        if keydown(KEY_SHIFT) and not clicked:  # Restart an attempt
            respawn()
            clicked = True

        elif not if_clicked():
            clicked = False


        if keydown(KEY_BACKSPACE):  # Player exits
            enter_browse_levels_menu()
            clicked = True


        # Player Dies

        elif player_y + PLAYER_HEIGHT > SCREEN_HEIGHT or check_collision():
            draw_player(RED)

            if levels[current_level][6] < percentage:  # New best
                levels[current_level][6] = percentage
                draw_centered_string(percentage_label + "%", 80, WHITE, bg_color)
                draw_centered_string("NEW BEST!", 100, WHITE, bg_color)

            start_wait = monotonic()


        # Endscreen

        elif player_x + PLAYER_WIDTH > levels[current_level][2] * 10 + map_offset_x:
            draw_player(bg_color)
            draw_level()
            draw_centered_string("LEVEL COMPLETED!", 100, DARK_GREEN, bg_color)

            levels[current_level][6] = 100.0
            colors[current_level + 1][1] = True

            start_wait = monotonic()

    elif menu == "level":
        current_wait = monotonic()
        if current_wait - start_wait < RESPAWN_TIME:
            continue

        if player_x + PLAYER_WIDTH > levels[current_level][2] * 10 + map_offset_x:
            enter_endscreen()
        else:  # Player died
            respawn()

    elif menu == "endscreen":
        start_wait = None

        if (
            keydown(KEY_EXE) or
            keydown(KEY_BACKSPACE) or
            keydown(KEY_OK) or
            keydown(KEY_SHIFT)
        ):  # Waiting for a key to be pressed
            clicked = True
            if keydown(KEY_SHIFT):
                respawn()
            else:
                enter_browse_levels_menu()

    elif menu == "garage":
        if keydown(KEY_RIGHT) and not clicked:
            menu_button += 1
            if menu_button > max_menu_buttons or menu_button < 1:
                menu_button = 1
            clicked = True
            draw_garage_menu()

        elif keydown(KEY_LEFT) and not clicked:
            menu_button -= 1
            if menu_button > max_menu_buttons or menu_button < 1:
                menu_button = max_menu_buttons
            clicked = True
            draw_garage_menu()

        if (keydown(KEY_EXE) or keydown(KEY_OK)) and not clicked:
            if colors[menu_button - 1][1]:
                player_color = colors[menu_button - 1][2]
                draw_garage_menu()

        if keydown(KEY_BACKSPACE) and not clicked:
            enter_main_menu()

        if not if_clicked() and clicked:
            clicked = False

    elif menu == "browse_levels":
        if keydown(KEY_RIGHT) and not clicked:
            menu_button += 1
            if menu_button > max_menu_buttons or menu_button < 1:
                menu_button = 1
            clicked = True
            draw_level_menu()

        if keydown(KEY_LEFT) and not clicked:
            menu_button -= 1
            if menu_button > max_menu_buttons or menu_button < 1:
                menu_button = max_menu_buttons
            clicked = True
            draw_level_menu()

        if (keydown(KEY_EXE) or keydown(KEY_OK)) and not clicked:
            current_level = menu_button - 1
            respawn()

        if keydown(KEY_BACKSPACE) and not clicked:
            enter_main_menu()

        if not if_clicked() and clicked:
            clicked = False

    elif menu == "main":
        if keydown(KEY_RIGHT) and not clicked:
            menu_button += 1
            if menu_button > max_menu_buttons or menu_button < 1:
                menu_button = 1
            clicked = True
            draw_main_menu()

        elif keydown(KEY_LEFT) and not clicked :
            menu_button -= 1
            if menu_button > max_menu_buttons or menu_button < 1:
                menu_button = max_menu_buttons
            clicked = True
            draw_main_menu()

        elif (not keydown(KEY_RIGHT)) and (not keydown(KEY_LEFT)) and clicked:
            clicked = False

        if keydown(KEY_EXE) or keydown(KEY_OK):
            if menu_button == 1:
                enter_garage_menu()
                clicked = True

            elif menu_button == 2:
                enter_browse_levels_menu()
                clicked = True

    if emulated:
        update()

    else:
        end = monotonic()
        wait = TICK - (end - start)
        if wait > 0:
            sleep(wait)
