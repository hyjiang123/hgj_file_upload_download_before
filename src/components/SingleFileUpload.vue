<template>
    <div>
      <el-form :inline="true" class="upload-form">
        <el-form-item label="上传地址">
          <el-input 
            v-model="uploadUrl" 
            placeholder="请输入上传地址（可选）"
            style="width: 300px">
          </el-input>
        </el-form-item>
      </el-form>

      <uploader
        browse_button="browse_button"
        :url="finalUploadUrl"
        :multi_selection="false"
        :FilesAdded="filesAdded"
        :BeforeUpload="beforeUpload"
        :Error="error"
        :UploadComplete="uploadComplete"
        :max_retries=3
        :filters="{
          mime_types : [
            { title : 'Image files', extensions : 'jpg,gif,png' },
            { title : 'Zip files', extensions : 'zip' }
          ],
          max_file_size : '400kb'
        }"
        @inputUploader="inputUploader"
      />
      <el-tag type="warning">只允许上传图片和zip文件, 最大只能上传400kb的文件</el-tag>
      <br/>
      <br/>
      <el-button type="primary" id="browse_button">选择文件</el-button>
      <br/>
      <el-table
        :data="tableData"
        style="width: 100%; margin: 10px 10px;">
        <el-table-column
          label="文件名">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="大小">
          <template slot-scope="scope">
            <span>{{scope.row.size}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status === -1">正在计算MD5</span>
            <span v-if="scope.row.status === 1 && scope.row.percent === 0">MD5计算完成，准备上传</span>
            <span v-if="scope.row.status === 4" style="color: brown">上传失败</span>
            <span v-if="scope.row.status === 5" style="color: chartreuse">已上传</span>
            <el-progress v-if="scope.row.status === 2 || scope.row.status === 1 && scope.row.percent > 0" :text-inside="true" :stroke-width="20" :percentage="scope.row.percent"></el-progress>
          </template>
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button type="danger" @click="deleteFile(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br/>
      <el-button 
        v-if="!isUploaded" 
        :disabled="uploading" 
        type="danger" 
        @click="uploadStart()">开始上传</el-button>
    </div>
</template>

<script>
  import Uploader from './Uploader'
  import FileMd5 from '../models/file-md5.js'

  export default {
    name: "SingleFileUpload",
    data() {
      return {
        server_config: this.global.server_config,
        files: [],
        up: {},
        tableData: [],
        uploading: false,
        isUploaded: false,
        uploadUrl: ''
      }
    },
    computed: {
      finalUploadUrl() {
        return this.uploadUrl || this.server_config.url + '/File/'
      }
    },
    watch: {
      files: {
        handler() {
          this.tableData = [];
          this.files.forEach((e) => {
            this.tableData.push({
              name: e.name,
              size: e.size,
              status: e.status,
              id: e.id,
              percent: e.percent
            });
            if (e.status === 5) {
              this.isUploaded = true;
            }
          });
        },
        deep: true
      }
    },
    methods: {
      filesAdded(up, files) {
        if (up.files.length > 1) {
          up.removeFile(up.files[0])
        }
        this.isUploaded = false;
        this.uploading = false;
        files.forEach((f) => {
          f.status = -1;
          FileMd5(f.getNative(), (e, md5) => {
            f["md5"] = md5;
            f.status = 1;
          });
        });
      },
      inputUploader(up) {
        this.up = up;
        this.files = up.files;
      },
      beforeUpload(up, file) {
        const params = {
          size: file.size,
          md5: file.md5
        };
        
        if (this.uploadUrl) {
          params.uploadUrl = this.uploadUrl;
        }
        
        up.setOption("multipart_params", params);
      },
      deleteFile(id) {
        let file = this.up.getFile(id);
        this.up.removeFile(file);
      },
      uploadStart() {
        this.uploading = true;
        this.up.start();
      },
      error() {
        this.uploading = false;
      },
      uploadComplete() {
        this.uploading = false;
      },
    },
    components: {
      'uploader': Uploader
    },
  }
</script>

<style scoped>
.upload-form {
  margin-bottom: 20px;
}
</style>
