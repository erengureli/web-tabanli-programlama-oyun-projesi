class Sprite{
    constructor({ position, imageSrc }){

        this.position = position

        this.image = new Image()
        this.image.src = imageSrc
        this.image.onload = () => {
            this.width = this.image.width
            this.height = this.image.height
        }

    }

    draw(){ // rendering sprite
        c.save()
        c.drawImage(this.image, this.position.x, this.position.y)
        c.restore()
    }
}