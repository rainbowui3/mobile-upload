<template>
 <div>
  <img-upload :image-preview-list="images"
            :on-success="onSuccess"
            :on-error="onError"
            :on-complete="onComplete"
            :before-upload="beforeUpload"
            :max="9"
            :url="url"
            :extra-data="extraData"
            :is-preview="true">
</img-upload>
 </div>
</template>

<script>
import ImgUpload from "./upload";
export default {
 
    data() {
        return {
            // 可以在组件加载前预先放置图片（例如在一些编辑的场景），若没有，则可设为空数组
            // 注意：每张图片拥有4个属性：data(用于预览图的展示)、url(用于储存后台返回的图片地址)、isUploading(用于正在上传蒙层的展示)、isError(用于上传失败蒙层的展示)
            // 其中isUploading和isError由组件自行控制。您也可以在钩子中手动控制
            images: [],

            // 后台接口地址，后台接收到的是文件的二进制流。注意：由于请求方法为POST，您可能需要用CORS等手段处理跨域问题
            url: 'https://my.server.com/uploadimg',

            // 您可以在formData内添加一些额外数据。注意：由于本组件中每张图片是单独上传的，因此每张图片的请求中都会携带该数据
            extraData: {desc: '这是图片描述'}
        }
    },
  components: {
    ImgUpload
  },
  methods:{
    onSuccess(data, img, list) {
            console.log(data)
            if (data.code == 0) {
                img.url = data.url
            } else {
                // 在请求的成功回调中，您可以通过返回`false`或一个`执行了reject()的Promise对象`来手动跳到失败回调（例如后台返回错误码等情况）
                return Promise.reject(data)
                // or
                return false
            }
        },

        onError(data, img, list) {
            // 若为请求失败，则data为空；若为返回的数据错误，则data为返回的数据
            alert('上传失败')
        },

        onComplete(data, img, list) {
            // 无论成功还是失败都会执行，执行时机为onSuccess或onError之后
            alert('上传完成')
        },

        beforeUpload(file) {
            // 每张图片上传前都会执行，若返回false，则阻止此次上传
            if(file.size > 1024*1024*10) {
                alert('上传图片不得大于10M！')
                return false
            }
        }
  }
}
</script>



