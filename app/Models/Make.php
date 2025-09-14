<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Make extends Model
{
    //
    protected $fillable = ['id','name'];

    public function models(){
        return $this->hasMany(CarModel::class);
    }
}
