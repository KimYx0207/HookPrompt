import pygame
import random
import sys

# Constants
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
GRID_SIZE = 20
GRID_WIDTH = WINDOW_WIDTH // GRID_SIZE
GRID_HEIGHT = WINDOW_HEIGHT // GRID_SIZE
FPS = 10

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
DARK_GREEN = (0, 200, 0)
GRAY = (128, 128, 128)

# Directions
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)

class Snake:
    def __init__(self):
        self.length = 1
        self.positions = [((WINDOW_WIDTH // 2), (WINDOW_HEIGHT // 2))]
        self.direction = random.choice([UP, DOWN, LEFT, RIGHT])
        self.color = GREEN
        self.score = 0

    def get_head_position(self):
        return self.positions[0]

    def turn(self, point):
        # Prevent 180 degree turns
        if self.length > 1 and (point[0] * -1 == self.direction[0] and point[1] * -1 == self.direction[1]):
            return
        self.direction = point

    def move(self):
        cur = self.get_head_position()
        x, y = self.direction
        new = (((cur[0] + (x * GRID_SIZE)) % WINDOW_WIDTH), (cur[1] + (y * GRID_SIZE)) % WINDOW_HEIGHT)

        # Check for wall collision (if we don't want wrapping)
        # To make it game over on wall hit instead of wrapping:
        cur_x, cur_y = cur
        new_x = cur_x + (x * GRID_SIZE)
        new_y = cur_y + (y * GRID_SIZE)

        if new_x < 0 or new_x >= WINDOW_WIDTH or new_y < 0 or new_y >= WINDOW_HEIGHT:
            self.reset()
            return True # Game Over

        if len(self.positions) > 2 and new in self.positions[2:]:
            self.reset()
            return True # Game Over
        else:
            self.positions.insert(0, new)
            if len(self.positions) > self.length:
                self.positions.pop()
            return False

    def reset(self):
        self.length = 1
        self.positions = [((WINDOW_WIDTH // 2), (WINDOW_HEIGHT // 2))]
        self.direction = random.choice([UP, DOWN, LEFT, RIGHT])
        self.score = 0

    def draw(self, surface):
        for index, p in enumerate(self.positions):
            color = self.color if index == 0 else DARK_GREEN
            r = pygame.Rect((p[0], p[1]), (GRID_SIZE, GRID_SIZE))
            pygame.draw.rect(surface, color, r)
            pygame.draw.rect(surface, BLACK, r, 1)

    def handle_keys(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    self.turn(UP)
                elif event.key == pygame.K_DOWN:
                    self.turn(DOWN)
                elif event.key == pygame.K_LEFT:
                    self.turn(LEFT)
                elif event.key == pygame.K_RIGHT:
                    self.turn(RIGHT)

class Food:
    def __init__(self):
        self.position = (0, 0)
        self.color = RED
        self.randomize_position()

    def randomize_position(self):
        self.position = (random.randint(0, GRID_WIDTH - 1) * GRID_SIZE, random.randint(0, GRID_HEIGHT - 1) * GRID_SIZE)

    def draw(self, surface):
        r = pygame.Rect((self.position[0], self.position[1]), (GRID_SIZE, GRID_SIZE))
        pygame.draw.rect(surface, self.color, r)
        pygame.draw.rect(surface, BLACK, r, 1)

def draw_grid(surface):
    for y in range(0, int(WINDOW_HEIGHT), int(GRID_SIZE)):
        for x in range(0, int(WINDOW_WIDTH), int(GRID_SIZE)):
            if (x + y) % (GRID_SIZE * 2) == 0:
                r = pygame.Rect((x, y), (GRID_SIZE, GRID_SIZE))
                pygame.draw.rect(surface, (40, 40, 40), r)

def draw_score(surface, score):
    font = pygame.font.Font(None, 36)
    score_text = font.render(f"Score: {score}", True, WHITE)
    surface.blit(score_text, (10, 10))

def game_over_screen(surface, score):
    font = pygame.font.Font(None, 72)
    text = font.render("GAME OVER", True, RED)
    text_rect = text.get_rect(center=(WINDOW_WIDTH/2, WINDOW_HEIGHT/2 - 50))

    score_font = pygame.font.Font(None, 48)
    score_text = score_font.render(f"Final Score: {score}", True, WHITE)
    score_rect = score_text.get_rect(center=(WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 20))

    restart_font = pygame.font.Font(None, 36)
    restart_text = restart_font.render("Press SPACE to Restart", True, GRAY)
    restart_rect = restart_text.get_rect(center=(WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 80))

    surface.blit(text, text_rect)
    surface.blit(score_text, score_rect)
    surface.blit(restart_text, restart_rect)
    pygame.display.update()

    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    waiting = False
                if event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()

def main():
    pygame.init()
    clock = pygame.time.Clock()
    screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT), 0, 32)
    pygame.display.set_caption('Python Snake Game')

    snake = Snake()
    food = Food()

    # Check if food spawns on snake
    while food.position in snake.positions:
        food.randomize_position()

    running = True
    while running:
        # Handle Input
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    snake.turn(UP)
                elif event.key == pygame.K_DOWN:
                    snake.turn(DOWN)
                elif event.key == pygame.K_LEFT:
                    snake.turn(LEFT)
                elif event.key == pygame.K_RIGHT:
                    snake.turn(RIGHT)
                elif event.key == pygame.K_ESCAPE:
                    running = False

        # Update
        game_over = snake.move()

        if game_over:
            game_over_screen(screen, snake.score)
            snake.reset()
            food.randomize_position()
            continue

        if snake.get_head_position() == food.position:
            snake.length += 1
            snake.score += 1
            food.randomize_position()
            # Ensure food doesn't spawn on snake
            while food.position in snake.positions:
                food.randomize_position()

        # Draw
        screen.fill(BLACK)
        draw_grid(screen) # Optional background grid
        snake.draw(screen)
        food.draw(screen)
        draw_score(screen, snake.score)

        pygame.display.update()
        clock.tick(FPS)

    pygame.quit()
    sys.exit()

if __name__ == '__main__':
    main()
