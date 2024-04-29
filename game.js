const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576
c.imageSmoothingEnabled = false

const fps = 60
var fpsCount = 0
var now, then, elapsed
var sceneNum = 0

var kill = 0
var startDate
var surviveDate
const velocity = 2.5

const attackCD = 30
const skillCD = 300
var attackTime = fpsCount
var skillTime = fpsCount
const attackStun = 15
const skillStun = 240

var mousex, mousey
var mouseAngle

const heartImg = './img/map/player/heart.png'

const cursoImgs = [
    'url("./img/map/mouse/cursor_cd1.png"), auto',
    'url("./img/map/mouse/cursor_cd2.png"), auto',
    'url("./img/map/mouse/cursor_cd3.png"), auto',
    'url("./img/map/mouse/cursor_attack.png"), auto'
]

// canavarların ortaya çıkma noktaları (8 tane)
const spawnPositions = [
    {
        x: ((canvas.width/2)-16)/3,
        y: ((canvas.height/2)-16)/3 - 200
    },
    {
        x: ((canvas.width/2)-16)/3,
        y: ((canvas.height/2)-16)/3 + 200
    },
    {
        x: ((canvas.width/2)-16)/3 - 200,
        y: ((canvas.height/2)-16)/3
    },
    {
        x: ((canvas.width/2)-16)/3 + 200,
        y: ((canvas.height/2)-16)/3
    },
    {
        x: ((canvas.width/2)-16)/3 + 150,
        y: ((canvas.height/2)-16)/3 + 150
    },
    {
        x: ((canvas.width/2)-16)/3 - 150,
        y: ((canvas.height/2)-16)/3 + 160
    },
    {
        x: ((canvas.width/2)-16)/3 + 150,
        y: ((canvas.height/2)-16)/3 - 160
    },
    {
        x: ((canvas.width/2)-16)/3 - 150,
        y: ((canvas.height/2)-16)/3 - 150
    }
]

// haraket etme kodları için tuşlar
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}


// Döngü ile her collision blok için Sprite obje oluşturuyor
const collisionsBlocks = []
for(let i = 0; i < collisions.length; i++){
    let col = i%100
    let row = (i-col)/100
    
    if(collisions[i] == 219){
        collisionsBlocks.push(new Sprite({
            position:{
                x: 16*col-627,
                y: 16*row-694
            },
            imageSrc:'./img/map/collisions.png'
        }))
    }
}


// Objeler //
// Konum objesi (Spesifik bir olay için kullanıyorum)
const pos = new Sprite({
    position:{
        x: 0,
        y: 0
    },
    imageSrc:'./img/map/map.png'
})

// Arkaplan
const mapBackground = new Sprite({
    position:{
        x: -627,
        y: -694
    },
    imageSrc:'./img/map/map.png'
})

// Arkaplan ama karakterimizin önünde renderlanan objeler (Kutular)
const mapForeground = new Sprite({
    position:{
        x: -627,
        y: -694
    },
    imageSrc:'./img/map/foreground.png'
})

// Oyuncu
const player = new Player({
    position:{
        x: ((canvas.width/2)-16)/3,
        y: ((canvas.height/2)-16)/3
    },
    velocity:{
        x: 0,
        y: 0
    }
})

// Sağ alttaki attack resmi
const attack = new Sprite({
    position:{
        x: canvas.width/3 - 32,
        y: canvas.height/3 - 16
    },
    imageSrc:'./img/map/player/attack.png'
})

// Sağ alttaki skill resmi
const skill = new Sprite({
    position:{
        x: canvas.width/3 - 16,
        y: canvas.height/3 - 16
    },
    imageSrc:'./img/map/player/skill.png'
})


var monsters = []
var hearts = []
const boundaries = [
    ...collisionsBlocks
]

var ui = []
var movables = []
var renderables = []

// Map(In Game) Game Loop
function mapScene(){

    // Karakterin canı bitince End Game Menu sahnesine göndercek
    if(player.health <= 0){
        sceneNum = 2
    }

    // Bütün arayleri yeniliyor(yeni canavar vb eklendiğinde renderlaması için)
    ui = []
    ui = ui.concat(hearts, attack, skill)

    renderables = []
    renderables = renderables.concat(mapBackground, player, mapForeground, monsters, ui)

    movables = []
    movables = movables.concat(pos, mapBackground, mapForeground, boundaries, monsters)


    // Render'lıyorum
    c.save()
    c.scale(3,3)

    // Renderables içindeki bütün eşyaları renderlıyor(draw() fonksiyonunu çağırıyor)
    renderables.forEach((item) => {
        item.draw()
    })

    // Maksimum vurabileceği yeri gösteren halkayı renderlıyor
    c.beginPath()
    c.strokeStyle = 'rgb(0, 0, 0, 0.6)'
    c.arc(((canvas.width/2) + 7)/3, ((canvas.height/2 + 6))/3, 50, 0, 2 * Math.PI, false)
    c.stroke()

    // Hayatta kalma süresini hesaplayıp renderlıyor
    surviveDate = new Date(Date.now() - startDate)
    c.font = '12px DotGothic16'
    c.textAlign = 'center'
    c.fillStyle = 'black'
    c.fillText(surviveDate.getMinutes().toString().padStart(2, '0') + ':' + surviveDate.getSeconds().toString().padStart(2, '0'), canvas.width/6, 10)

    // Kill'leri hesaplıyor
    c.font = '12px DotGothic16'
    c.textAlign = 'right'
    c.fillStyle = 'black'
    c.fillText('Kills: ' + kill, canvas.width/3, 10)

    // Attack ve Skill dolma animasyonunu renderlıyor
    if( fpsCount <= skillTime + skillCD){
        c.fillStyle = 'rgb(0, 0, 0, 0.7)'
        c.fillRect(canvas.width/3 - 16 + 1, canvas.height/3 - (fpsCount-skillTime)/skillCD * 16 + 1, 14, (fpsCount-skillTime)/skillCD * 16 - 2)
    }
    if( fpsCount <= attackTime + attackCD){
        c.fillStyle = 'rgb(0, 0, 0, 0.7)'
        c.fillRect(canvas.width/3 - 32 + 1, canvas.height/3 - (fpsCount-attackTime)/attackCD * 16 + 1, 14, (fpsCount-attackTime)/attackCD * 16 - 2)
    }

    c.restore()


    player.changeAnim(0) // Oyuncunun animasyonunu resetliyor
    player.right = (mousex >= 512) // Oyuncunun yönünü farenin yerie göre değiştiriyor


    // Canavarları oluşturuyor(Aynı anda max 5 tane oluşturuyor)
    if(monsters.length <= 4){
        let ranodmi = Math.floor(Math.random()*8 -0.1)
        monsters.push(new Monster({
            position: {
                x: spawnPositions[ranodmi].x + pos.position.x,
                y: spawnPositions[ranodmi].y + pos.position.y
            },
            velocity:{
                x: 0,
                y: 0
            },
            imgSrc: './img/map/monster/slime.png',
            imgMirrorSrc: './img/map/monster/slime_mirror.png'
        }))
    }

    // Bütün canvarları teker teker çağırıyoruz(foreach)
    monsters.forEach((item, index) => {
        // Canavarın canı 0'dan az ise öldürüyor
        if(item.health <= 0){
            monsters.splice(index, 1)
            kill++
        }

        // Canavarın oyuncuyu takip etmesini sağlıyor
        item.goto(player.position)

        // Canavarlardan biri oyuncuyla çakışıyorsa 2'side hasar alıyor ve canavar geriye doğru uçuyor
        if(rectangularCollision({rectangle1:player, rectangle2:item})){
            item.canWalk = fpsCount + attackStun
            item.getHit()
            item.health--
            player.getHit()
            player.health--
            let dx = player.position.x - item.position.x
            let dy = player.position.y - item.position.y
            let hypotenuse = Math.sqrt(dx*dx + dy*dy)
            item.position.x += -velocity * 10 * dx/hypotenuse
            item.position.y += -velocity * 10 * dy/hypotenuse
        }
    })


    // Sağ üstteki kalplerin oluşması (azalması, artması)
    if(hearts.length > player.health){
        hearts.pop()
    }
    else if(hearts.length < player.health){
        hearts.push(new Sprite({
            position:{
                x: hearts.length * 16,
                y: 0
            },
            imageSrc: './img/map/player/heart.png'
        }))
    }


    // Attack bekleme süresindeyken fare iconunun değişmesi
    if(fpsCount >= attackTime + attackCD){
        canvas.style.cursor = cursoImgs[3]
    }
    else if(fpsCount >= attackTime + (attackCD*2)/3 ){
        canvas.style.cursor = cursoImgs[0]
    }
    else if(fpsCount >= attackTime + (attackCD*1)/3 ){
        canvas.style.cursor = cursoImgs[1]
    }
    else if(fpsCount >= attackTime){
        canvas.style.cursor = cursoImgs[2]
    }

    // W A S D ile haraket komutu
    let move = true 
    if(keys.w.pressed){
        player.changeAnim(1)

        for(let i=0; i<boundaries.length; i++){
            let item = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...item, position:{ x: item.position.x, y: item.position.y + 3}}
            })){
                move = false
                break
            }
        }
        if(move){
            movables.forEach((item) => {
                item.position.y += velocity
            })
        }
    }
    else if(keys.a.pressed){
        player.changeAnim(1)

        for(let i=0; i<boundaries.length; i++){
            let item = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...item, position:{ x: item.position.x + 3, y: item.position.y}}
            })){
                move = false
                break
            }
        }
        if(move){
            movables.forEach((item) => {
                item.position.x += velocity
            })
        }
    }
    else if(keys.s.pressed){
        player.changeAnim(1)

        for(let i=0; i<boundaries.length; i++){
            let item = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...item, position:{ x: item.position.x, y: item.position.y - 3}}
            })){
                move = false
                break
            }
        }
        if(move){
            movables.forEach((item) => {
                item.position.y += -velocity
            })
        }
    }
    else if(keys.d.pressed){
        player.changeAnim(1)

        for(let i=0; i<boundaries.length; i++){
            let item = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...item, position:{ x: item.position.x - 3, y: item.position.y}}
            })){
                move = false
                break
            }
        }
        if(move){
            movables.forEach((item) => {
                item.position.x += -velocity
            })
        }
    }
}// Map(In Game) Game Loop End


// Objeler
const backgroundMenu = new Sprite({
    position:{
        x: 0,
        y: 0
    },
    imageSrc:'./img/menu/background.png'
})

const playButton = new Sprite({
    position:{
        x: (canvas.width)/6 - 46,
        y: (canvas.height)/6 - 14
    },
    imageSrc:'./img/menu/play_button.png'
})

// End Menu Scene
function endMenuScene(){
    c.save()
    backgroundMenu.draw() // Arkaplanı renderliyoruz

    c.font = '80px DotGothic16'
    c.textAlign = 'center'
    c.fillStyle = 'red'
    c.fillText('YOU DIED', canvas.width/2, canvas.height*1/3) // YOU DIED yazısı

    // Time ve Kills yazıları
    c.font = '50px DotGothic16'
    c.fillStyle = 'black'
    c.fillText('Time: ' + surviveDate.getMinutes().toString().padStart(2, '0') + ':' + surviveDate.getSeconds().toString().padStart(2, '0') , canvas.width/2, canvas.height/2)
    c.fillText('Kills: ' + kill, canvas.width/2, canvas.height*2/3)
    c.restore()
}

// Menu Game Loop
function menuScene(){
    c.save()
    backgroundMenu.draw() // Arkaplan
    c.scale(3,3)
    playButton.draw() // Play buttonu
    c.restore()
}


// Main Game Loop
then = Date.now()
function gameloop(){
    window.requestAnimationFrame(gameloop) // Loop code

    // Sabit 60 FPS için özel kod
    now = Date.now();
    elapsed = now - then;
    if (elapsed > (1000/fps)) {
        then = now - (elapsed % (1000/fps));

        // sceneNum neyse ona göre sceneyi çağırıyor
        switch(sceneNum){
            case 0: // Menu
                menuScene()
                break
            case 1: // Map
                mapScene()
                break
            case 2: // End Menu 
                endMenuScene()
                break
        }

        fpsCount++
    }
}

// Event Listeners //

// Mouse Sol Tuş
canvas.addEventListener('click', (event) => {

    // Farenin x ve y değerlerini hesaplıyoruz
    let x = event.pageX - (canvas.clientLeft + canvas.offsetLeft)
    let y = event.pageY - (canvas.clientTop + canvas.offsetTop)

    if(sceneNum == 0){ // Ana Menudeki Play butonu
        if(x < 643 && y < 320 && x > 366 && y > 237){
            sceneNum = 1
            startDate = new Date(Date.now())
        }
    }
    else if(sceneNum == 1){ // Attack
        if(fpsCount >= attackTime + attackCD){
            player.attack() // Oyuncu attack animasyonu
            monsters.forEach((item) => { // Herhangi bir canavar oyuncunun attack alanının içine girdimi diye kontrol ediyor(uzaklık hesabıyla)
                let distance = Math.sqrt(Math.pow(item.position.y+4 - player.position.y, 2) + Math.pow(item.position.x+4 - player.position.x, 2))
                if(distance <= 55){
                    item.getHit()
                    if(item.canWalk <= fpsCount + attackStun){
                        item.canWalk = fpsCount + attackStun
                    }
                    item.health -= player.damage
                }
            })
            attackTime = fpsCount // Attack bekleme süresini ayarlıyor
        }
    }
})

// Farenin kordinatlarını alıyorum
canvas.addEventListener('mousemove', (event) => {
    mousex = event.pageX - (canvas.clientLeft + canvas.offsetLeft)
    mousey = event.pageY - (canvas.clientTop + canvas.offsetTop)
})

// Klavye girdileri
window.addEventListener('keydown', (event) => {

    if(sceneNum == 1){
        switch(event.key){
            case 'w':
                keys.w.pressed = true
                break
            case 'a':
                keys.a.pressed = true
                break
            case 's':
                keys.s.pressed = true
                break
            case 'd':
                keys.d.pressed = true
                break
            case 'e': // E Skill
                if(fpsCount >= skillTime + skillCD){
                    monsters.forEach((item) => { // Stuning all monsters
                        if(item.canWalk <= fpsCount + skillStun){
                            item.canWalk = fpsCount + skillStun
                        }
                    })
                    skillTime = fpsCount
                }
                break
        }
    }

})

// Klavye girdisi bitince (yürüme için)
window.addEventListener('keyup', (event) => {

    if(sceneNum == 1){
        switch(event.key){
            case 'w':
                keys.w.pressed = false
                break
            case 'a':
                keys.a.pressed = false
                break
            case 's':
                keys.s.pressed = false
                break
            case 'd':
                keys.d.pressed = false
                break
        }
    }

})