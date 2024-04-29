class Player{
    constructor({ position, velocity }){

        this.position = position
        this.velocity = velocity

        this.health = 5
        this.damage = 1

        this.image = new Image()
        this.image.src = './img/map/player/player.png'

        this.imageMirror = new Image()
        this.imageMirror.src = './img/map/player/player_mirror.png'
        
        this.width = 16
        this.height = 16

        this.canAnim = true

        this.fpsFrame = 30

        this.animNo = 0
        this.frame = 0
        this.right = true

    }

    draw(){
        if(fpsCount % this.fpsFrame == 0) this.frame++

        if(this.animNo == 0 && this.frame >= 2){
            this.frame = 0
            this.fpsFrame = 30
        }
        else if(this.animNo == 1 && this.frame >= 4){
            this.frame = 0
            this.fpsFrame = 12
        }
        else if(this.animNo == 2 && this.frame >= 5){
            this.frame = 0
            this.fpsFrame = 30
            this.animNo = 0
        }
        else if(this.animNo == 3 && this.frame != 1){
            this.frame = 0
            this.fpsFrame = 30
            this.animNo = 0
            this.canAnim = true
        }

        c.save()
        if(this.right) c.drawImage(this.image, 16 + 48*this.frame, 16 + 16*this.animNo, this.width, this.width,this.position.x, this.position.y, this.width, this.height)
        else c.drawImage(this.imageMirror, 16 + 48*this.frame, 16 + 16*this.animNo, this.width, this.width,this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }

    changeAnim(no){

        if(this.animNo == 2) return
        if(!this.canAnim) return

        if(no == 0){
            this.animNo = 0
            this.fpsFrame = 30
        }
        else if(no == 1){
            this.animNo = 1
            this.fpsFrame = 12
        }

    }

    getHit(){
        this.animNo = 3
        this.frame = 1
        this.fpsFrame = 10
        this.canAnim = false
    }

    attack(){
        this.animNo = 2
        this.fpsFrame = 3
        this.frame = 0
    }
}