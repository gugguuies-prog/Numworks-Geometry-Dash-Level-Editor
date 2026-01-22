# A recreation of Geometry Dash for Numworks calculators.
# Credits: Calm_Repeat_7267 and wperez274

from time import sleep
from random import randint
from kandinsky import fill_rect as FILL, draw_string as STR
from ion import KEY_OK, KEY_EXE, KEY_UP, keydown as KEY


START_MENU_COLOR = (0, 0, 0)

FILL(0, 0, 322, 222, START_MENU_COLOR)
STR("Geometry Dash", 90, 60, "white", START_MENU_COLOR)
STR("Key [Up]/[OK] = Jump", 60, 100, "white", START_MENU_COLOR)
STR("Click [EXE] to play", 65, 140, "white", START_MENU_COLOR)

sleep(0.5)

while not KEY(KEY_EXE):  # Waiting for a key to be pressed
    pass

game = True
TICK = 1/30  # 30 FPS

levels: list[tuple[
    list[list[int]],    # blocks[x_tile, y_tile, width_tiles, height_tiles]
    list[list[int]],    # spikes[x_tile, y_tile, orientation]
    int,                # level end (mesured in tiles)
    tuple[int,int,int], # bg color (red, green, blue)
    tuple[int,int,int]  # ground color (red, green, blue)
]] = [
    (  # Level 1
        [
            [0, 6, 32, 1], [32, 5, 58, 2], [90, 4, 30, 3], [108, 3, 12, 1], [120, 6, 74, 1], [128, 3, 8, 1], [132, 2, 22, 1], [150, 1, 26, 1], [162, 5, 32, 1], [172, 2, 20, 1], [202, 5, 42, 2], [248, 4, 4, 3], [254, 5, 4, 2], [260, 6, 16, 1]
        ],
        [
            [218, 5, 0], [133, 4, 1], [42, 5, 0], [52, 5, 0], [62, 5, 0], [73, 5, 0], [82, 5, 0], [144, 6, 0], [146, 6, 0], [142, 2, 0], [151, 1, 0], [164, 1, 0], [160, 6, 0], [166, 5, 0], [153, 3, 1], [158, 2, 1], [176, 3, 1], [220, 5, 0], [230, 5, 0], [240, 5, 0], [268, 6, 0]
        ],
        276, (0, 130, 240), (0, 0, 70)
    ),
    (  # Level 2
        [
            [0, 6, 32,1], [28, 5, 26, 1], [42, 4, 12, 1], [62, 5, 24, 1], [82, 4, 4, 1], [94, 6, 108, 1], [94, 5, 42, 1], [94, 4, 38, 1], [118, 3, 14, 1], [138, 3, 8, 1], [142, 2, 24, 1], [162, 3, 8, 1], [174, 5, 14, 1], [206, 6, 4, 1], [216, 6, 20, 1], [240, 5, 10, 1], [254, 4, 8, 1], [266, 3, 6, 1], [32, 6, 54, 1]
        ],
        [
            [158, 6, 0], [159, 2, 0], [126, 3, 0], [106, 4, 0], [104, 4, 0], [73, 5, 0], [63, 5, 0], [50, 4, 0], [35, 5, 0], [124, 3, 0], [149, 2, 0], [151, 2, 0], [157, 2, 0], [150, 6, 0], [156, 6, 0], [195, 6, 0], [224, 6, 0], [226, 6, 0], [181, 5, 0], [244, 5, 0]
        ],
        272, (0, 250, 80), (0, 70, 70)
    ),
    (  # Level 3
        [
            [0, 6, 32, 1], [172, 6, 42, 1], [110, 6, 24, 1], [66, 4, 32, 1], [56, 5, 46, 2], [52, 5, 2, 2], [32, 5, 18, 2], [120, 5, 4, 1], [120, 3, 4, 1], [140, 5, 4, 2], [148, 4, 4, 3], [154, 3, 4, 4], [160, 4, 4, 3], [166, 5, 4, 2], [220, 6, 52, 1], [248, 5, 24, 1], [258, 4, 14, 1]
        ],
        [
            [184, 6, 0], [169, 5, 0], [167, 5, 0], [121, 3, 0], [123, 3, 0], [92, 4, 0], [53, 5, 0], [41, 5, 0], [83, 4, 0], [74, 4, 0], [186, 6, 0], [194, 6, 0], [202, 6, 0], [204, 6, 0], [217, 6, 1], [217, 6, 0], [249, 5, 0], [230, 6, 0], [239, 6, 0], [259, 4, 0]
        ],
        272, (200, 0, 0), (50, 0, 0)
    ),
    (  # Level 4
        [
            [0, 6, 32, 1], [48, 4, 23, 1], [35, 5, 36, 1], [32, 6, 77, 1], [104, 5, 5, 1], [79, 5, 14, 1]
        ],
        [
            [92, 5, 0], [80, 5, 0], [59, 4, 0], [61, 4, 0], [36, 5, 0], [20, 6, 0], [103, 6, 0]
        ],
        109, (0, 190, 190), (0, 30, 30)
    )
]

game_started = False

current_level = 0

player_x = 50
player_y = 172

map_offset_x = 0

can_jump = True

is_jumping = False
is_falling = False

jump_velocity = 32
air_ticks = 0

PLAYER_WIDTH = 20
PLAYER_HEIGHT = 20

RESPAWN_TIME = 1

attempts = 0

bg_color = (0, 0, 0)
player_color = (0, 0, 0)
ground_color = (0, 0, 0)
RANDOMIZE_COLORS = False
DARK_GREEN = (0, 150, 0)
DARK_BLUE = (0, 0, 150)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)

SCREEN_WIDTH = 320
TILE_SIZE_X = 10


def get_visible_tile_range():
    first_tile = (-map_offset_x) // TILE_SIZE_X - 2
    last_tile = first_tile + (SCREEN_WIDTH // TILE_SIZE_X) + 4
    return first_tile, last_tile

def draw_player(color: tuple[int, int, int] | None = None):
    global PLAYER_WIDTH, PLAYER_HEIGHT, player_color
    if color:
        FILL(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT, color)
    else:
        FILL(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT, player_color)

def draw_spike(x_tile: int, y_tile: int, orientation: int):
    for i in range(5):
        FILL(
            map_offset_x + x_tile * 10 - 10 + i * 2,
            y_tile * 32 - i * 4 + (2 * i * 4 * orientation) - 4 * (1 - orientation), 20 - i * 4, 4, ground_color
        )
        FILL(
            map_offset_x + x_tile * 10 + 10 - i * 2,
            y_tile * 32 - i * 4 + (2 * i * 4 * orientation) - 4 * (1 - orientation), 6, 4, bg_color
        )

def draw_platform(x_tile: int, y_tile: int, width_tiles: int, height_tiles: int):
    FILL(
        map_offset_x + x_tile * 10, y_tile * 32,
        10 * width_tiles, height_tiles * 32, ground_color
    )

    if width_tiles < 0:
        FILL(map_offset_x + x_tile * 10, y_tile * 32, 6, height_tiles * 32, bg_color)
    else:
        FILL(map_offset_x + x_tile * 10 + width_tiles * 10, y_tile * 32, 6, height_tiles*32, bg_color)

def height_tiles(tile_x: int):
    FILL(map_offset_x + tile_x * 10, 0, 10, 222, (0, 255, 0))
    FILL(map_offset_x + tile_x * 10 + 10, 0, 6, 222, bg_color)

def draw_level():
    first_tile, last_tile = get_visible_tile_range()

    # Spikes
    for x, y, orientation in levels[current_level][1]:
        if first_tile <= x <= last_tile:
            draw_spike(x, y, orientation)

    # Platforms
    for x, y, w, h in levels[current_level][0]:
        if x + w >= first_tile and x <= last_tile:
            draw_platform(x, y, w, h)

    # Endwall
    end_x = levels[current_level][2]
    if first_tile <= end_x <= last_tile:
        FILL(map_offset_x + end_x * 10, 0, 10, 222, (0, 255, 0))
        FILL(map_offset_x + end_x * 10 + 10, 0, 6, 222, bg_color)


def respawn():
    global attempts, map_offset_x, player_y, bg_color
    attempts += 1

    set_colors()
    FILL(0, 0, 320, 222, bg_color)
    map_offset_x = 0
    player_y = 172
    draw_level()
    draw_player()

def set_colors():
    global bg_color, player_color, ground_color, current_level, levels

    if RANDOMIZE_COLORS:
        player_color = (randint(0, 155), randint(0, 155), randint(0, 155))
        bg_color = (randint(210, 255), randint(210, 255), randint(210, 255))
        ground_color = (randint(0, 55), randint(0, 55), randint(0, 55))

    else:
        player_color = (255, 255, 0)
        bg_color = levels[current_level][3]
        ground_color = levels[current_level][4]

def get_player_tile_x():
    return (-map_offset_x + player_x) // 10

def check_collision():
    px = player_x
    py = player_y
    pw = PLAYER_WIDTH
    ph = PLAYER_HEIGHT

    player_tile = get_player_tile_x()
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
            px + pw > rx and px < rx + rw and
            py + ph > ry and py < ry + rh
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
            px + pw > rx and px < rx + 16 and
            py + ph > hit_y1 and py < hit_y2
        ):
            return True

    return False


respawn()


while game:  # Game loop
    # Physics

    if not is_jumping:
        for i in range(len(levels[current_level][0])):
            if (
                player_y + 20 == levels[current_level][0][i][1] * 32 and levels[current_level][0][i][0] * 10 + map_offset_x -19 <= 50 <= levels[current_level][0][i][2] * 10 + levels[current_level][0][i][0] * 10 + map_offset_x
            ):
                can_jump = True
                is_falling=False
                break
            else:
                can_jump = False
                is_falling = True

        if is_falling == True:
            draw_player(bg_color)
            player_y += 16

        if (
            KEY(KEY_OK) and can_jump == True
            or KEY(KEY_UP) and can_jump == True
        ):
            draw_player(bg_color)
            is_jumping = True
            player_y -= int(jump_velocity)
            jump_velocity = jump_velocity / 2

    elif can_jump:
        draw_player(bg_color)

        for k in range(len(levels[current_level][0])):
            if player_y + 20 != levels[current_level][0][k][1] * 32:
                is_jumping = True
            elif (
                levels[current_level][0][k][0] * 10 + map_offset_x-19 < 50 < levels[current_level][0][k][0] * 10 + map_offset_x + levels[current_level][0][k][2] * 10 + 20
            ):
                is_jumping = False
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
            can_jump = True


    # Labels

    attempts_label = str(attempts)

    if attempts < 100:
        attempts_label = "0" + attempts_label
        if attempts < 10:
            attempts_label = "0" + attempts_label

    STR(" Level:" + str(current_level + 1) + " ", 0, 0, bg_color, BLACK)
    STR(" Attempts:" + attempts_label + " ", 180, 0, "red", BLACK)


    # Drawing

    draw_player(player_color)

    map_offset_x -= 6
    draw_level()

    if player_y + PLAYER_HEIGHT > 222 or check_collision():  # player dies
        draw_level()
        draw_player(RED)

        sleep(RESPAWN_TIME)
        respawn()


    sleep(TICK)  # tick


    # Endscreen

    if player_x + PLAYER_WIDTH > levels[current_level][2] * 10 + map_offset_x:
        FILL(0, 0, 322, 222, BLACK)
        STR("LEVEL COMPLETED", 85, 60, GREEN, BLACK)
        STR("Click [EXE] to go", 75, 100, WHITE, BLACK)
        STR("to the level " + str(current_level + 2), 90, 140, WHITE, BLACK)

        current_level += 1  # Next level
        if len(levels) == current_level:  # No more levels
            break

        while not KEY(KEY_EXE):  # Waiting for a key to be pressed
            pass

        respawn()

# Game endscreen

FILL(0, 0, 322, 222, DARK_GREEN)
STR("GAME COMPLETED!", 85, 60, WHITE, DARK_GREEN)
STR("Attempts:" + str(attempts), 110, 100, WHITE, DARK_GREEN)
STR("By Gild56 (Subscribe on YT)", 30, 140, WHITE, DARK_GREEN)
