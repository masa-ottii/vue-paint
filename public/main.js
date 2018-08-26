var ctx = null;
var canvas = null;
var timer = null;
var drawLine = function(from,to,color,thickness){
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}
var app = new Vue({
    el: '#app',
    data: {
        color: 'hsl(0,50%,50%)', //色
        thickness: 5,    //太さ
        drawFlag:false,  //描画状態のフラグ
        coordinate:[],   //描画位置の記録
        sliderValue: 0,  //色スライダーの値
    },
    // Vueインスタンスが生成された時に動くやつ
    created(){
        // ブラウザウィンドウのリサイズ時にCanvasの座標系が変わってしまうことへの対処
        window.addEventListener('resize',()=>{
            if(timer === null ){
                timer = setTimeout(()=>{
                    // 現在のWindowの大きさでCanvasの大きさをリセット
                    canvas.width  = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;
                    // リセットすると描画が消えてしまうので、記録から再現する。
                    this.coordinate.reduce((prev, current) => {
                        if(!prev.end){ //開始点が描画終了の点だった場合は描画をスキップ
                            // 線の描画
                            let c = current.color ? current.color : this.color; 
                            drawLine(prev,current,c,this.thickness);
                        }
                        return current;
                    });
                    clearTimeout(timer);
                    timer = null;
                },200);
            }
        });
    },
    // Vueインスタンスが破棄される前にうごくやつ
    beforeDestroy(){
        // お行儀よくイベントリスナーを破棄しとく事
        window.removeEventListener('resize');
    },
    // Vueインスタンスが画面に適用される時にうごくやつ
    // このタイミングでDOMが触れるようになる！
    mounted() {
        canvas = this.$refs.canvas; // DOMからCANVAS要素を得る！
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx = canvas.getContext('2d');
    },
    methods:{
        changeColor: function(){
            this.color = `hsl(${this.sliderValue},50%,50%)`;
        },
        drawOn: function(event){
            this.drawFlag = true; // 描画開始状態に変更
        },
        drawOff: function(event){
            this.drawFlag = false; // 描画終了状態に変更
            let lastPoint = this.coordinate[this.coordinate.length - 1];
            lastPoint.end = true;  // この描画位置で描画が終了したことを付記
        },
        draw: function(event){
            // 描画開始状態のときにマウスを動かすと線を書く
            if(this.drawFlag){
                // 前回の描画位置を取得
                let beginPoint = this.coordinate[this.coordinate.length - 1];
                // 前回の描画位置を取得
                let endPoint = {x:event.offsetX,y:event.offsetY};
                // 前回の描画位置が取得でき、かつ描画終了位置でないときだけ描画開始
                if(beginPoint && !beginPoint.end ){
                    // 線の描画
                    drawLine(beginPoint,endPoint,this.color,this.thickness);
                    // 描画色の記録
                    endPoint.color = this.color; 
                    // 描画位置の記録
                    this.coordinate.push( endPoint );
                }else{
                    // 描画位置の開始点だけ記録
                    this.coordinate.push( endPoint );
                }
            }
        }
    }
})
