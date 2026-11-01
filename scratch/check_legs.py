from PIL import Image

pants = Image.open(r'C:\Users\Renat\Desktop\Conblox\scratch\pants_test.png')
shirt = Image.open(r'C:\Users\Renat\Desktop\Conblox\scratch\shirt_test.png')

# Right Leg / Right Arm
# L at 19, B at 85, R at 151, F at 217
print("Right Leg faces:")
rl_f = pants.crop((217, 355, 217+64, 355+128))
rl_b = pants.crop((85, 355, 85+64, 355+128))
rl_l = pants.crop((19, 355, 19+64, 355+128))
rl_r = pants.crop((151, 355, 151+64, 355+128))
rl_f.save(r'C:\Users\Renat\Desktop\Conblox\scratch\rl_front.png')
rl_b.save(r'C:\Users\Renat\Desktop\Conblox\scratch\rl_back.png')

# Left Leg / Left Arm
# F at 307, L at 373, B at 439, R at 505
print("Left Leg faces:")
ll_f = pants.crop((307, 355, 307+64, 355+128))
ll_b = pants.crop((439, 355, 439+64, 355+128))
ll_l = pants.crop((373, 355, 373+64, 355+128))
ll_r = pants.crop((505, 355, 505+64, 355+128))
ll_f.save(r'C:\Users\Renat\Desktop\Conblox\scratch\ll_front.png')
ll_b.save(r'C:\Users\Renat\Desktop\Conblox\scratch\ll_back.png')

print("Saved rl_front, rl_back, ll_front, ll_back")
