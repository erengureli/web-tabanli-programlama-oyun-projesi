class Monster{
    constructor({ position, velocity, imgSrc, imgMirrorSrc }){

        this.position = position
        this.velocity = velocity

        this.maxVelocity = 1

        this.health = 2
        this.damage = 1

        this.image = new Image()
        this.image.src = imgSrc

        this.imageMirror = new Image()
        this.imageMirror.src = imgMirrorSrc
        
        this.width = 16
        this.height = 16

        this.canWalk = fpsCount
        this.canAnim = true

        this.fpsFrame = 30

        this.animNo = 0
        this.frame = 0
        this.right = true

    }

    draw(){ // Canavarı renderliyor
        if(fpsCount % this.fpsFrame == 0) this.frame++

        if(this.animNo == 0 && this.frame >= 2){
            this.frame = 0
            this.fpsFrame = 30
        }
        else if(this.animNo == 1 && this.frame >= 4){
            this.frame = 0
            this.fpsFrame = 12
        }
        else if (this.health > 0 && this.animNo == 3 && this.frame != 1){
            this.frame = 0
            this.animNo = 0
            this.fpsFrame = 30
        }
        else if(this.health <= 0 && this.animNo == 3 && this.frame >= 3){
            
        }

        this.move()

        c.save()
        if(this.right) c.drawImage(this.image, 16 + 48*this.frame, 16 + 16*this.animNo, this.width, this.width,this.position.x, this.position.y, this.width, this.height)
        else c.drawImage(this.imageMirror, 16 + 48*this.frame, 16 + 16*this.animNo, this.width, this.width,this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }

    move(){ // Karakterin hizina göre konumunu değiştiriyor
        if(this.canWalk < fpsCount){
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        }
    }

    changeAnim(no){ // Animasyonu değiştiriyo

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

    getHit(){ // Hasar alınca özel animasyon giriyor
        this.animNo = 3
        this.frame = 1
        this.fpsFrame = 10
        this.canAnim = false
    }

    goto(pos){ // Girilen pozisyona doğru hızı değişiyor
        let dx = pos.x - this.position.x
        let dy = pos.y - this.position.y
        let hypotenuse = Math.sqrt(dx*dx + dy*dy)
        this.changeAnim(1)  
        this.right = 0<=dx
        this.velocity.x = this.maxVelocity * dx/hypotenuse
        this.velocity.y = this.maxVelocity * dy/hypotenuse
    }
}